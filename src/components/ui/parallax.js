// NPM only. CDN users: ignore this block.

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function sectionTransition01(scopeOrConfig = document, maybeConfig = {}) {
  const DEFAULT_CONFIG = {
    parallaxY: 400,
    revealY: 0,
    overlayColor: "black",
    autoAdvance: true,
    mobile: {
      breakpoint: 768,
      strategy: "simplify",
    },
  };

  const isScope = (value) => value instanceof Element || value instanceof Document;

  const getConfig = (overrides = {}) => ({
    ...DEFAULT_CONFIG,
    ...overrides,
    mobile: {
      ...DEFAULT_CONFIG.mobile,
      ...(overrides.mobile || {}),
    },
  });

  const getYValue = (section, fallback) => {
    const yValue = parseFloat(section.dataset.stY || String(fallback));
    return Number.isNaN(yValue) ? fallback : yValue;
  };

  const getOpacityValue = (section) => {
    const opacityValue = parseFloat(section.dataset.stOpacity || "");
    if (Number.isNaN(opacityValue)) return null;
    return Math.max(0, Math.min(1, opacityValue));
  };

  const getOverlayColor = (section, fallback) => section.dataset.stOverlay || fallback;

  const getOverlayElement = (section, color) => {
    let overlay = section.querySelector("[data-st-overlay-el]");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("data-st-overlay-el", "");
      overlay.setAttribute("aria-hidden", "true");
      section.append(overlay);
    }

    if (getComputedStyle(section).position === "static") {
      section.style.position = "relative";
    }

    section.style.isolation = "isolate";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "2",
      pointerEvents: "none",
      background: color,
      opacity: "0",
      willChange: "opacity",
    });

    return overlay;
  };

  const resetOverlay = (section) => {
    const existingOverlay = section.querySelector("[data-st-overlay-el]");
    if (existingOverlay) {
      gsap.set(existingOverlay, { opacity: 0 });
    }
  };

  const getConfiguredYValue = (section, mode, config) => {
    if (mode === "reveal") {
      return getYValue(section, config.revealY);
    }

    if (mode === "parallax") {
      return getYValue(section, config.parallaxY);
    }

    return 0;
  };

  const isMobileViewport = (config) => (
    window.matchMedia(`(max-width: ${config.mobile.breakpoint}px)`).matches
  );

  const getMobileStrategy = (config) => {
    const allowed = new Set(["same", "disable", "simplify"]);
    return allowed.has(config.mobile.strategy)
      ? config.mobile.strategy
      : DEFAULT_CONFIG.mobile.strategy;
  };

  const hasYMotion = (mode, y) => mode === "parallax" || (mode === "reveal" && y !== 0);

  const resolveTransition = (mode, y, strategy, isMobile) => {
    if (!isMobile || strategy === "same" || !hasYMotion(mode, y)) {
      return { mode, y };
    }

    if (strategy === "disable") {
      return { mode: "none", y: 0 };
    }

    if (mode === "parallax") {
      return { mode: "pin", y: 0 };
    }

    return { mode, y: 0 };
  };

  const scope = isScope(scopeOrConfig) ? scopeOrConfig : document;
  const config = getConfig(isScope(scopeOrConfig) ? maybeConfig : scopeOrConfig);
  const mobileStrategy = getMobileStrategy(config);
  const isMobile = isMobileViewport(config);
  const sections = scope.querySelectorAll("[data-st-01]");

  sections.forEach((section) => {
    const configuredMode = section.getAttribute("data-st-01") || "parallax";
    const configuredY = getConfiguredYValue(section, configuredMode, config);
    const opacity = getOpacityValue(section);
    const { mode, y } = resolveTransition(
      configuredMode,
      configuredY,
      mobileStrategy,
      isMobile,
    );

    if (mode === "none") {
      resetOverlay(section);
      return;
    }

    if (mode === "reveal") {
      const previousSection = section.previousElementSibling;
      if (!previousSection) return;

      gsap.set(previousSection, { zIndex: 1 });
      gsap.set(section, {
        position: "sticky",
        bottom: 0,
        zIndex: 0,
      });

      if (opacity === null) resetOverlay(section);

      if (y === 0 && opacity === null) return;

      let isAutoAdvancing = false;

      const triggerAdvanceToBottom = () => {
        if (isAutoAdvancing) return;
        isAutoAdvancing = true;
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
        setTimeout(() => {
          isAutoAdvancing = false;
        }, 1000);
      };

      // Detecta a próxima ação de scroll a partir do momento em que o usuário está no último projeto
      const handleNextActionIntent = (e) => {
        if (!config.autoAdvance || isAutoAdvancing) return;
        const maxScroll = previousSection.offsetTop + previousSection.offsetHeight - window.innerHeight;
        const currentY = window.scrollY;

        if (currentY >= maxScroll - 120 && currentY <= maxScroll + 60) {
          if (e.deltaY > 3) {
            triggerAdvanceToBottom();
          }
        }
      };

      let touchStartY = 0;
      const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e) => {
        if (!config.autoAdvance || isAutoAdvancing) return;
        const maxScroll = previousSection.offsetTop + previousSection.offsetHeight - window.innerHeight;
        const currentY = window.scrollY;
        const delta = touchStartY - e.touches[0].clientY;

        if (currentY >= maxScroll - 120 && currentY <= maxScroll + 60) {
          if (delta > 8) {
            triggerAdvanceToBottom();
          }
        }
      };

      window.addEventListener("wheel", handleNextActionIntent, { passive: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });

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

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: previousSection,
          start: "bottom bottom",
          end: () => `+=${section.offsetHeight}`,
          scrub: 0.5,
          snap: {
            snapTo: (progress, self) => {
              if (self.direction === 1 && progress > 0.02) return 1;
              if (self.direction === -1 && progress < 0.75) return 0;
              return progress;
            },
            duration: { min: 0.4, max: 0.8 },
            delay: 0.02,
            ease: "power2.out",
          },
          onUpdate: (self) => {
            if (
              config.autoAdvance &&
              !isAutoAdvancing &&
              self.direction === 1 &&
              self.progress > 0.02 &&
              self.progress < 0.95
            ) {
              triggerAdvanceToBottom();
            }
          },
        },
      });

      if (y !== 0) {
        timeline.fromTo(section, {
          y,
        }, {
          y: 0,
          ease: "none",
          force3D: true,
        }, 0);
      }

      if (opacity !== null) {
        const overlay = getOverlayElement(section, getOverlayColor(section, config.overlayColor));
        gsap.set(overlay, { opacity });
        timeline.to(overlay, { opacity: 0, ease: "none" }, 0);
      }

      return;
    }

    const nextSection = section.nextElementSibling;
    if (!nextSection) return;

    if (mode === "pin") {
      ScrollTrigger.create({
        trigger: nextSection,
        start: "top bottom",
        end: "top top",
        pin: section,
        pinSpacing: false,
      });

      if (configuredMode === "parallax" && opacity !== null) {
        const overlay = getOverlayElement(section, getOverlayColor(section, config.overlayColor));

        gsap.timeline({
          scrollTrigger: {
            trigger: nextSection,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }).to(overlay, { opacity, ease: "none" }, 0);
        return;
      }

      resetOverlay(section);
      return;
    }

    const scrollTrigger = {
      trigger: nextSection,
      start: "top bottom",
      end: "top top",
      scrub: true,
    };

    const tween = {
      y,
      ease: "none",
      force3D: true,
    };

    if (opacity === null) {
      resetOverlay(section);
      gsap.to(section, { ...tween, scrollTrigger });
      return;
    }

    const overlay = getOverlayElement(section, getOverlayColor(section, config.overlayColor));

    gsap.timeline({ scrollTrigger })
      .to(section, tween, 0)
      .to(overlay, { opacity, ease: "none" }, 0);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  sectionTransition01();
});