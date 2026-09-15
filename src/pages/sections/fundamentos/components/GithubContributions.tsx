import { useEffect, useState } from 'react';
import { ActivityCalendar, type Activity } from 'react-activity-calendar';

interface Props {
  initialData?: Activity[];
  username?: string;
}

export default function GithubContributions({
  initialData,
  username = 'isaacmachado-dev',
}: Props) {
  const [data, setData] = useState<Activity[] | null>(
    initialData && initialData.length > 0 ? initialData : null
  );
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data && data.length > 0) return;

    let ignore = false;
    setLoading(true);

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao buscar contribuições');
        return res.json();
      })
      .then((json) => {
        if (!ignore && json.contributions) {
          setData(json.contributions);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar contribuições do GitHub:', err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [username, data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-neutral font-space-mono animate-pulse">
        Carregando contribuições do GitHub...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted font-space-mono">
        Não foi possível carregar as contribuições no momento.
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-2 text-white font-space-mono">
      <ActivityCalendar
        data={data}
        colorScheme="dark"
        theme={{
          dark: ['#242429', '#0e4429', '#006d32', '#26a641', '#39d353'],
        }}
        labels={{
          totalCount: '{{count}} contribuições no último ano',
          months: [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
          ],
          weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
          legend: {
            less: 'Menos',
            more: 'Mais',
          },
        }}
        blockSize={12}
        blockRadius={3}
        blockMargin={4}
        fontSize={12}
      />
    </div>
  );
}
