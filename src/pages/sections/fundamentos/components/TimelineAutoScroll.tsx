import { cn } from "@/lib/utils";
import { Award, GraduationCap } from "lucide-react";
import { useEffect, useRef } from "react";

export interface TimelineData {
  title: string;
  subtitle?: string;
  period: string;
  isAward?: boolean;
}

const DEFAULT_ITEMS: TimelineData[] = [
  {
    title: "Ensino Superior",
    subtitle: "UNIVESP — Engenharia da Computação",
    period: "2023-2028",
  },
  {
    title: "Alura React",
    period: "2026",
    isAward: true,
  },
  {
    title: "IBM IA & Machine learning",
    period: "2025",
    isAward: true,
  },
  {
    title: "QP Summit 2025",
    period: "2025",
    isAward: true,
  },
  {
    title: "Alura Cloud DEV-Ops",
    period: "2025",
    isAward: true,
  },
  {
    title: "Alura DEV Games",
    period: "2025",
    isAward: true,
  },
  {
    title: "Postman API Fundamentals Student Expert",
    period: "2025",
    isAward: true,
  },
  {
    title: "Amazon AWS Educate Introduction to Generative AI",
    period: "2025",
    isAward: true,
  },
  {
    title: "Imersão DEV Back-End",
    period: "2025",
    isAward: true,
  },
  {
    title: "Ensino Médio",
    period: "2020-2022",
  },
  {
    title: "Ensino Fundamental",
    period: "2010-2019",
  },
];

interface TimelineAutoScrollProps {
  items?: TimelineData[];
  className?: string;
}

export function TimelineAutoScroll({
  items = DEFAULT_ITEMS,
  className,
}: TimelineAutoScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const original = originalRef.current;
    if (!track || !original) return;

    let pos = 0;
    const normalSpeed = 0.55;
    const slowSpeed = 0.15;
    let currentSpeed = normalSpeed;
    let targetSpeed = normalSpeed;
    let animationFrameId: number;

    const onMouseEnter = () => {
      targetSpeed = slowSpeed;
    };

    const onMouseLeave = () => {
      targetSpeed = normalSpeed;
    };

    track.addEventListener("mouseenter", onMouseEnter);
    track.addEventListener("mouseleave", onMouseLeave);

    const loop = () => {
      const originalHeight = original.offsetHeight;

      if (originalHeight > 0) {
        currentSpeed += (targetSpeed - currentSpeed) * 0.08;
        pos -= currentSpeed;

        if (pos <= -originalHeight) {
          pos += originalHeight;
        }

        track.style.transform = `translate3d(0, ${pos}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      track.removeEventListener("mouseenter", onMouseEnter);
      track.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [items]);

  const renderItem = (item: TimelineData, index: number) => {
    const Icon = item.isAward ? Award : GraduationCap;

    return (
      <div
        key={index}
        className="timeline-item group relative flex flex-row items-center gap-3 sm:gap-5 w-full py-2.5 sm:py-3"
      >
        <div className="relative flex items-center justify-center shrink-0 w-6 self-stretch">
          <div className="absolute -top-4 bottom-1/2 w-0.5 bg-white left-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="absolute top-1/2 -bottom-4 w-0.5 bg-white left-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shrink-0" />
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-md flex-1 min-w-0 max-w-lg text-ink shadow-sm flex flex-col justify-between">
          <div className="flex flex-col min-w-0">
            <div className="flex flex-row gap-2.5 items-center min-w-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="font-space-grotesk font-bold text-base sm:text-lg leading-snug">
                {item.title}
              </span>
            </div>
            {item.subtitle && (
              <div className="ml-7 sm:ml-8 mt-1 text-xs sm:text-sm font-space-mono text-neutral-700">
                {item.subtitle}
              </div>
            )}
          </div>

          <div className="period-bottom flex @[680px]:hidden mt-3 pt-2 border-t border-neutral-200/80 items-center justify-between text-xs font-space-mono">
            <span className="font-bold text-neutral-800">{item.period}</span>
          </div>
        </div>

        <div className="period-side hidden @[680px]:flex items-center justify-end text-white font-space-mono text-sm whitespace-nowrap shrink-0 w-24 text-right pr-2">
          {item.period}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative flex-1 w-full h-full min-h-0 overflow-hidden",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 z-20 bg-gradient-to-b from-[#0F0F0F] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-20 bg-gradient-to-t from-[#0F0F0F] to-transparent" />

      <div
        ref={trackRef}
        className="timeline-carousel-track relative w-full flex flex-col will-change-transform"
      >
        <div
          ref={originalRef}
          className="@container relative flex flex-col p-1 sm:p-2"
        >
          {items.map((item, i) => renderItem(item, i))}
        </div>

        <div
          className="@container relative flex flex-col p-1 sm:p-2"
          aria-hidden="true"
        >
          {items.map((item, i) => renderItem(item, items.length + i))}
        </div>
      </div>
    </div>
  );
}

export default TimelineAutoScroll;
