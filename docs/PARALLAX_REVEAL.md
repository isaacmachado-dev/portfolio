# Parallax Reveal & TextReveal Synchronization

Documentação da arquitetura e sincronização entre as animações de scroll ([`src/components/ui/parallax.js`](../src/components/ui/parallax.js)), revelação tipográfica ([`src/components/ui/textReveal.js`](../src/components/ui/textReveal.js)) e a listagem dinâmica de projetos ([`src/pages/sections/projetos/components/ProjectsSection.tsx`](../src/pages/sections/projetos/components/ProjectsSection.tsx)).

---

## 1. Visão Geral da Mecânica (Projetos $\rightarrow$ Contato)

A transição entre a seção de **Projetos** e o rodapé de **Contato** utiliza uma técnica de **curtain reveal**:
1. **Empilhamento de Camadas (Stacking Context)**:
   - A seção anterior (`#projetos`) possui `zIndex: 1`.
   - O rodapé (`#contato`) possui `position: sticky; bottom: 0; zIndex: 0; min-h-screen`.
2. **Revelação por Rolagem**:
   - Enquanto o usuário navega por `#projetos`, `#contato` permanece fixo na base da tela sob a camada opaca de Projetos.
   - Ao atingir o fim de Projetos, o cortinado de Projetos continua subindo, desvelando Contato de baixo para cima.

---

## 2. Puxada e Detecção de Intenção no Último Projeto

Para evitar que o usuário precise rolar "espaço vazio" após o último projeto demonstrado ou perca a sensação de fluidez:

### 2.1. Detecção da Próxima Ação
No [`parallax.js`](../src/components/ui/parallax.js), ouvintes de `wheel` e `touchmove` calculam dinamicamente a posição do fim da seção:

```javascript
const maxScroll = previousSection.offsetTop + previousSection.offsetHeight - window.innerHeight;
const currentY = window.scrollY;

if (currentY >= maxScroll - 120 && currentY <= maxScroll + 60) {
  if (e.deltaY > 3) {
    triggerAdvanceToBottom();
  }
}
```

- **Comportamento**: Quando o usuário para no último projeto da categoria ativa, o próximo leve toque de descida é imediatamente interceptado.
- **Ação**: A página executa um `window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })`, puxando o rodapé suavemente até o final.
- **Rolagem Reversa**: A subida não é bloqueada (`deltaY < 0`), permitindo ao usuário voltar a Projetos sem travamentos.

### 2.2. Snap Direcional
Na timeline do GSAP ScrollTrigger:
- **Descida (`direction === 1`)**: ao passar de 2% do reveal, o snap assegura fechamento em 100%.
- **Subida (`direction === -1`)**: caso o usuário role para cima além de 25% de volta, o snap reverte para 0%, restabelecendo a visão do último projeto.

---

## 3. Sincronização com `textReveal.js`

- **Problema anterior**: O gatilho disparava com o rodapé ainda encoberto (`revealScrollStart: "bottom 85%"`), esgotando a duração de 1s da animação antes do texto se tornar visível.
- **Correção**: Ajustado para `revealScrollStart: "bottom 35%"`.
- **Efeito**: As palavras da frase *"Bons projetos começam com uma boa ideia..."* entram em cascata com `ease: "expo.out"` exatamente no momento em que o título é desvelado no centro da tela.

---

## 4. Reatividade a Mudanças de Altura (Filtros & Accordions)

A seção de Projetos é interativa (React) e altera sua altura dinamicamente ao:
1. Alternar abas de filtro (`destaques` com 4 projetos $\leftrightarrow$ `todos` com 8 projetos $\leftrightarrow$ `reais` com 3 projetos).
2. Expandir ou recolher os accordions de detalhes dos projetos.

### 4.1. ResizeObserver no `parallax.js`
O `parallax.js` monitora o elemento `previousSection` (`#projetos`) em tempo real:

```javascript
if (typeof ResizeObserver !== "undefined") {
  let refreshTimeout;
  const ro = new ResizeObserver(() => {
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);
  });
  ro.observe(previousSection);
}
```

### 4.2. Disparo de Evento em `ProjectsSection.tsx`
Tanto a troca de `activeTab` quanto a mudança no estado `isOpen` dos accordions disparam `window.dispatchEvent(new Event("resize"))` após as transições do Framer Motion / React, garantindo que o ScrollTrigger nunca fique com coordenadas defasadas.
