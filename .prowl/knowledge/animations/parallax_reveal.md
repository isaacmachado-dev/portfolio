---
type: Concept
title: Parallax Reveal and TextReveal Synchronization
tags: [animation, parallax, scrolltrigger, textreveal]
---
The transition between the Projetos (Projects) section and the Contato (Contact) footer uses a sticky curtain-reveal mechanic where Projetos (zIndex: 1) scrolls up over Contato (position: sticky, bottom: 0, zIndex: 0).

Key behaviors:
1. Next-Action Intent Detection: On the last demonstrated project (calculated dynamically as maxScroll - 120px), wheel and touch down-scroll events trigger auto-advance via window.scrollTo to the bottom.
2. Directional Snap: ScrollTrigger snap completes reveal to 1 on forward scroll (progress > 0.02) and reverts to 0 on significant upward scroll (progress < 0.75).
3. TextReveal Synchronization: textReveal01 trigger in reveal mode starts at bottom 35% of the previous section, ensuring the heading animation plays as words enter the visual center.
4. Dynamic Resizing: ResizeObserver on previousSection and resize events dispatched on React tab/accordion state changes trigger ScrollTrigger.refresh() so trigger points dynamically update when project count or accordion height changes.
