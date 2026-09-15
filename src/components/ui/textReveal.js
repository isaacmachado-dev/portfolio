// NPM only. CDN users: ignore this block.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, ScrollTrigger);

export function textReveal01(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const CONFIG = {
    lines: { duration: 1, stagger: 0.06, ease: "expo.out" },
    words: { duration: 1, stagger: 0.03, ease: "expo.out" },
    chars: { duration: 0.6, stagger: 0.01, ease: "expo.out" },
    scrollStart: "top 72%",
    revealScrollStart: "bottom 85%",
    scrubStart: "top 80%",
    scrubEnd: "top 20%",
    once: false,
    markers: false,
  };

  const allSplitEls = scope.querySelectorAll("[data-reveal-01]");
  const autoEls = ignoreManual
    ? [...allSplitEls]
    : [...allSplitEls].filter((el) => !el.hasAttribute("data-manual"));

  gsap.set(autoEls, { visibility: "visible" });

  allSplitEls.forEach((el) => {
    const splitType = el.getAttribute("data-reveal-01");
    const c = CONFIG[splitType];
    if (!c) return;

    let type;
    let mask;
    let linesClass;
    let wordsClass;
    let charsClass;

    switch (splitType) {
      case "lines":
        type = "lines";
        mask = "lines";
        linesClass = "line";
        break;
      case "words":
        type = "words, lines";
        mask = "words";
        wordsClass = "word";
        linesClass = "line";
        break;
      case "chars":
        type = "chars, words, lines";
        mask = "chars";
        charsClass = "char";
        wordsClass = "word";
        linesClass = "line";
        break;
      default:
        return;
    }

    if (!ignoreManual && el.hasAttribute("data-manual")) {
      SplitText.create(el, {
        type,
        mask,
        autoSplit: true,
        ...(linesClass && { linesClass }),
        ...(wordsClass && { wordsClass }),
        ...(charsClass && { charsClass }),
      });
      return;
    }

    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";

    // Suporte para trigger em seções com parallax reveal ou trigger customizado
    const customTriggerSelector = el.getAttribute("data-trigger");
    const revealSection = el.closest('[data-st-01="reveal"]');
    const prevSection = revealSection ? revealSection.previousElementSibling : null;

    let triggerEl = el;
    let defaultStart = CONFIG.scrollStart;

    if (customTriggerSelector) {
      const customEl = document.querySelector(customTriggerSelector);
      if (customEl) {
        triggerEl = customEl;
      }
    } else if (revealSection && prevSection) {
      triggerEl = prevSection;
      defaultStart = CONFIG.revealScrollStart;
    }

    SplitText.create(el, {
      type,
      mask,
      autoSplit: true,
      ...(linesClass && { linesClass }),
      ...(wordsClass && { wordsClass }),
      ...(charsClass && { charsClass }),
      onSplit(instance) {
        const durationValue = parseFloat(el.dataset.duration);
        const staggerValue = parseFloat(el.dataset.stagger);
        const delayValue = parseFloat(el.dataset.delay);
        const duration = Number.isNaN(durationValue) ? c.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? c.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = el.dataset.ease || c.ease;

        const targets = instance[splitType];
        const once = el.hasAttribute("data-once")
          ? el.getAttribute("data-once") !== "false"
          : CONFIG.once;

        const tween = {
          yPercent: 110,
          duration,
          stagger,
          delay: useScroll ? elDelay : elDelay + delay,
          immediateRender: true,
          ease,
        };

        if (useScrub) {
          const scrubStart = el.dataset.scrollStart || (triggerEl !== el ? "bottom bottom" : CONFIG.scrubStart);
          const scrubEnd = el.dataset.scrollEnd || (triggerEl !== el ? () => `+=${revealSection ? revealSection.offsetHeight : 300}` : CONFIG.scrubEnd);
          tween.scrollTrigger = {
            trigger: triggerEl,
            start: scrubStart,
            end: scrubEnd,
            scrub: true,
            markers: CONFIG.markers,
            ...(once && { onLeave: (self) => self.kill(false) }),
          };
        } else if (useScroll) {
          const customStart =
            (scrollMode && scrollMode !== "true" && scrollMode !== "")
              ? scrollMode
              : (el.dataset.scrollStart || defaultStart);

          const toggleActions = el.dataset.toggleActions || "play none none reverse";

          tween.scrollTrigger = {
            trigger: triggerEl,
            start: `clamp(${customStart})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions }),
          };
        }

        return gsap.from(targets, tween);
      },
    });
  });
}

export function initTextReveal() {
  if (typeof window === "undefined") return;

  const init = () => {
    textReveal01();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

initTextReveal();

export default textReveal01;