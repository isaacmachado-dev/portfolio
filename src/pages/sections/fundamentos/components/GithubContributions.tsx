import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 350, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 350, damping: 25 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    setIsHovered(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="w-full flex justify-center py-2 text-white font-space-mono">
      
      <a 
        href="https://www.github.com/isaacmachado-dev"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => { }}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="group relative block overflow-hidden cursor-pointer sm:cursor-none select-none"
          aria-label="Abrir em uma nova aba"
      >
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

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                x: smoothX,
                y: smoothY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              className="pointer-events-none absolute top-0 left-0 z-30 hidden sm:flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-2xl font-space-grotesk tracking-wide"
            >
              <span>Ver GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.div>
          )}
        </AnimatePresence>
      </a>

    </div>
  );
}
