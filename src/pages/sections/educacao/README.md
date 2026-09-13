# Educação — `src/pages/sections/educacao/`

## Estrutura
- `Educacao.astro`: Seção container com cabeçalho enumerado (`03/`), título serifado (`Fraunces`) e divisor horizontal.
- `components/EducacaoFrame.astro`: Container com moldura técnica (cantos reforçados nos 4 vértices), linha do tempo vertical contínua conectora e suporte a múltiplos itens via props ou slot.
- `components/EducacaoItem.astro`: Item atômico da linha do tempo contendo o marcador circular, card branco com ícone e texto (`font-space-grotesk` / `font-space-mono`), e o período/ano alinhado à direita.

## Props & Tipagens

### `EducacaoFrame.astro`
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `string?` | `undefined` | Título exibido acima da moldura |
| `items` | `TimelineItem[]?` | `undefined` | Lista de dados para renderizar os cards |
| `showCorners` | `boolean` | `true` | Exibe os 4 cantos brancos reforçados |
| `showLine` | `boolean?` | `auto` | Controle manual da linha conectora vertical |
| `scrollable` | `boolean?` | `auto` | Habilita scroll interno com scrollbar lateral estilizada |
| `class` | `string?` | `""` | Classes CSS extras para o container de fundo |

> **Uso como moldura vazia:** `<EducacaoFrame />` ou `<EducacaoFrame></EducacaoFrame>` renderiza apenas a moldura (fundo escuro + 4 cantos), sem nenhum item ou linha no meio. Caso queira itens, passe-os via prop `items` ou dentro do `<slot>`.

### `TimelineItem` / `EducacaoItem.astro`
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Obrigatório | Título do item (ex: `"Ensino Superior"`, `"Curso Full Stack"`) |
| `subtitle` | `string?` | `undefined` | Instituição ou descrição complementar |
| `period` | `string` | Obrigatório | Ano ou período (ex: `"2023-2028"`) |
| `icon` | `ComponentType<{ className?: string }>?` | `GraduationCap` | Componente de ícone (ex: `lucide-react`) |

> `EducacaoItem.astro` também oferece um slot nomeado `<slot name="icon" />` para customizações livres de ícone/SVG.

## Exemplos de Uso

### 1. Novo frame (ex: Cursos) passando lista com ícones personalizados
```astro
---
import EducacaoFrame from "./components/EducacaoFrame.astro";
import { BookOpen, Award } from "lucide-react";

const cursos = [
  {
    title: "Curso Full Stack",
    subtitle: "Rocketseat",
    period: "2023",
    icon: BookOpen,
  },
  {
    title: "Certificação Cloud",
    subtitle: "Google Cloud",
    period: "2024",
    icon: Award,
  },
];
---

<EducacaoFrame title="Cursos" items={cursos} />
```

### 2. Composição declarativa via `<slot>`
```astro
---
import EducacaoFrame from "./components/EducacaoFrame.astro";
import EducacaoItem from "./components/EducacaoItem.astro";
import { BookOpen, Award } from "lucide-react";
---

<EducacaoFrame title="Cursos">
  <EducacaoItem
    title="Curso Full Stack"
    subtitle="Rocketseat"
    period="2023"
    icon={BookOpen}
  />
  <EducacaoItem
    title="Certificação Cloud"
    subtitle="Google Cloud"
    period="2024"
    icon={Award}
  />
</EducacaoFrame>
```
