# Fundamentos — `src/pages/sections/fundamentos/`

## Estrutura
- `Fundamentos.astro`: Seção container com cabeçalho enumerado (`02/`), título serifado (`Fraunces`) e divisor horizontal.
- `components/FundamentosFrameContainer.astro`: Container com moldura técnica (cantos reforçados nos 4 vértices), linha do tempo vertical contínua conectora e suporte a múltiplos itens via props ou slot.
- `components/FundamentosFrameItem.astro`: Item atômico da linha do tempo contendo o marcador circular, card branco com ícone e texto (`font-space-grotesk` / `font-space-mono`), e o período/ano alinhado à direita.

## Props & Tipagens

### `FundamentosFrameContainer.astro`
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `string?` | `undefined` | Título exibido acima da moldura |
| `items` | `TimelineItem[]?` | `undefined` | Lista de dados para renderizar os cards |
| `showCorners` | `boolean` | `true` | Exibe os 4 cantos brancos reforçados |
| `showLine` | `boolean?` | `auto` | Controle manual da linha conectora vertical |
| `scrollable` | `boolean?` | `auto` | Habilita scroll interno com scrollbar lateral estilizada |
| `class` | `string?` | `""` | Classes CSS extras para o container de fundo |

> **Uso como moldura vazia:** `<FundamentosFrameContainer />` ou `<FundamentosFrameContainer></FundamentosFrameContainer>` renderiza apenas a moldura (fundo escuro + 4 cantos), sem nenhum item ou linha no meio. Caso queira itens, passe-os via prop `items` ou dentro do `<slot>`.

### `TimelineItem` / `FundamentosFrameItem.astro`
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Obrigatório | Título do item (ex: `"Ensino Superior"`, `"Curso Full Stack"`) |
| `subtitle` | `string?` | `undefined` | Instituição ou descrição complementar |
| `period` | `string` | Obrigatório | Ano ou período (ex: `"2023-2028"`) |
| `icon` | `ComponentType<{ className?: string }>?` | `GraduationCap` | Componente de ícone (ex: `lucide-react`) |

> `FundamentosFrameItem.astro` também oferece um slot nomeado `<slot name="icon" />` para customizações livres de ícone/SVG.

## Exemplos de Uso

### 1. Novo frame (ex: Cursos) passando lista com ícones personalizados
```astro
---
import FundamentosFrame from "./components/FundamentosFrameContainer.astro";
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

<FundamentosFrame title="Cursos" items={cursos} />
```

### 2. Composição declarativa via `<slot>`
```astro
---
import FundamentosFrame from "./components/FundamentosFrameContainer.astro";
import FundamentosItem from "./components/FundamentosFrameItem.astro";
import { BookOpen, Award } from "lucide-react";
---

<FundamentosFrame title="Cursos">
  <FundamentosItem
    title="Curso Full Stack"
    subtitle="Rocketseat"
    period="2023"
    icon={BookOpen}
  />
  <FundamentosItem
    title="Certificação Cloud"
    subtitle="Google Cloud"
    period="2024"
    icon={Award}
  />
</FundamentosFrame>
```
