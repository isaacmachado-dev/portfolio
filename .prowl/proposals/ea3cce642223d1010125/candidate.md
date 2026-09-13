---
type: Concept
title: Projects Section Component Architecture
tags: [portfolio, projects, ui]
prowl:
    anchors:
        - path: src/pages/sections/projetos/Projetos.astro
          line_start: 1
          line_end: 81
          content_hash: sha256:c38419dcb9882c676899c125ec46e96bba57288b5d828a748701eb635ebba435
---
The Projetos (Projects) section displays portfolio projects using alternating layout orientations (media frame on left / text on right for project 1, and text on left / media frame on right for project 2). Employs ProjectFrame for media rendering and nested ProjectAccordion components for descriptions, roles, and tech stack details. Layout uses flex items-start to prevent frame jumping when accordions expand.
