"use client";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  SendHorizontal,
  TerminalIcon
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type TerminalProps = {
  command?: string;
  steps?: string[];
  finalMessage?: string;
  stepDelay?: number;
  typingDelay?: number;
  icon?: React.ReactNode;
  promptSymbol?: string;
  inputPlaceholder?: string;
  autoExecute?: boolean;
  repeat?: boolean;
  repeatDelay?: number;
  className?: string;
  title?: string;
  variant?: "default" | "sky" | "synthwave" | "retro";
};

type ThemeTokens = {
  glow: string;
  surface: string;
  promptText: string;
  accentText: string;
  accentBg: string;
  ring: string;
};

const THEMES: Record<string, ThemeTokens> = {
  default: {
    glow: "shadow-[0_0_30px_-15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_12px_-10px_rgba(16,185,129,0.15)]",
    surface:
      "from-emerald-50/70 to-stone-100 text-emerald-700 dark:from-[#0a0f0d] dark:to-[#050807] dark:text-emerald-300",
    promptText: "text-emerald-600 dark:text-emerald-300",
    accentText: "text-emerald-500",
    accentBg: "bg-emerald-500",
    ring: "ring-emerald-600/30 dark:ring-emerald-300/25",
  },
  sky: {
    glow: "shadow-[0_0_30px_-15px_rgba(56,189,248,0.15)] dark:shadow-[0_0_12px_-10px_rgba(56,189,248,0.15)]",
    surface:
      "from-sky-50/70 to-stone-100 text-sky-700 dark:from-[#080b12] dark:to-[#04060a] dark:text-sky-300",
    promptText: "text-sky-600 dark:text-sky-300",
    accentText: "text-sky-500",
    accentBg: "bg-sky-500",
    ring: "ring-sky-600/30 dark:ring-sky-300/25",
  },
  synthwave: {
    glow: "shadow-[0_0_30px_-15px_rgba(217,70,239,0.15)] dark:shadow-[0_0_12px_-10px_rgba(217,70,239,0.15)]",
    surface:
      "from-fuchsia-50/70 to-stone-100 text-fuchsia-700 dark:from-[#0d020f] dark:to-[#050106] dark:text-fuchsia-400",
    promptText: "text-fuchsia-600 dark:text-fuchsia-300",
    accentText: "text-fuchsia-500",
    accentBg: "bg-fuchsia-500",
    ring: "ring-fuchsia-600/30 dark:ring-fuchsia-300/25",
  },
  retro: {
    glow: "shadow-[0_0_30px_-15px_rgba(245,158,11,0.15)] dark:shadow-[0_0_12px_-12px_rgba(245,158,11,0.15)]",
    surface:
      "from-amber-50/70 to-stone-100 text-amber-700 dark:from-[#140d02] dark:to-[#0a0600] dark:text-amber-300",
    promptText: "text-amber-600 dark:text-amber-300",
    accentText: "text-amber-500",
    accentBg: "bg-amber-500",
    ring: "ring-amber-600/40 dark:ring-amber-300/25",
  },
};

const BUILTIN_COMMANDS: Record<string, string[]> = {
  help: [
    "Comandos disponíveis:",
    "  help       - Mostra esta lista de ajuda",
    "  arch       - Informações do sistema Arch Linux",
    "  sobre      - Sobre o desenvolvedor Isaac",
    "  skills     - Principais tecnologias e ferramentas",
    "  clear      - Limpa a tela do terminal",
  ],
  arch: [
    "       /\\         OS: Arch Linux x86_64",
    "      /  \\        Kernel: 6.12.1-arch1-1",
    "     /\\   \\       Shell: zsh 5.9",
    "    /      \\      WM: Hyprland / Wayland",
    "   /   ,,   \\     Terminal: kitty",
    "  /   |  |  -\\    Editor: Neovim / VS Code",
    " /_-''    ''-_\\   Uptime: 24/7",
  ],
  sobre: [
    "Isaac Machado — Desenvolvedor Full-Stack",
    "- Cristão",
    "- Engenheiro da Computação na UNIVESP",
    "- Focado em interfaces modernas, design e alta performance",
    "- I use archlinux btw",
  ],
  about: [
    "Isaac Machado — Full-Stack Developer",
    "Computer Engineering student at UNIVESP.",
    "Focused on modern UI, editorial design, and performance.",
  ],
  skills: [
    "Frontend: TypeScript, React, Next.js, Astro, TailwindCSS",
    "Backend: Node.js, Express, Python, REST APIs",
    "DevOps & Tools: Linux (Arch), Git, Docker, Figma",
  ],
};

const InteractiveTerminal: React.FC<TerminalProps> = ({
  command = "help",
  steps,
  finalMessage,
  stepDelay = 800,
  typingDelay = 80,
  icon = <TerminalIcon className="h-4 w-4" />,
  promptSymbol = ">",
  inputPlaceholder = "Digite um comando… (tente 'help' ou 'arch')",
  autoExecute = false,
  repeat = false,
  repeatDelay = 3000,
  className,
  title = "zsh — 80×24",
  variant = "default",
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [typing, setTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const outputRef = useRef<HTMLDivElement>(null);
  const scriptTimerRef = useRef<NodeJS.Timeout | null>(null);

  const t = THEMES[variant] || THEMES.default;

  const resetTerminal = useCallback(() => {
    if (scriptTimerRef.current) {
      clearInterval(scriptTimerRef.current);
      scriptTimerRef.current = null;
    }
    setOutput([]);
    setBusy(false);
    setCompleted(false);
    setTyping(false);
    setCharIndex(0);
    setInput("");
  }, []);

  // Executa uma sequência de passos (scripted steps) de forma segura
  const runCustomSteps = useCallback(
    (customSteps: string[], finalMsg?: string) => {
      setBusy(true);
      setCompleted(false);
      let stepIndex = 0;

      if (scriptTimerRef.current) {
        clearInterval(scriptTimerRef.current);
      }

      scriptTimerRef.current = setInterval(() => {
        if (stepIndex < customSteps.length) {
          const currentStep = customSteps[stepIndex];
          setOutput((prev) => [...prev, currentStep]);
          stepIndex++;
        } else {
          if (scriptTimerRef.current) {
            clearInterval(scriptTimerRef.current);
            scriptTimerRef.current = null;
          }
          if (finalMsg) {
            setOutput((prev) => [...prev, finalMsg]);
          }
          setBusy(false);
          setCompleted(true);
        }
      }, stepDelay);
    },
    [stepDelay],
  );

  // Manipula qualquer comando executado
  const handleExecuteCommand = useCallback(
    (cmdText: string) => {
      const trimmed = cmdText.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();

      if (lower === "clear") {
        setOutput([]);
        setCompleted(true);
        return;
      }

      // Adiciona o comando ao histórico
      setOutput((prev) => [...prev, `${promptSymbol} ${trimmed}`]);

      // Se há steps personalizados passados por prop (ex: TerminalDemo2)
      if (steps && steps.length > 0 && (lower === command.toLowerCase() || !BUILTIN_COMMANDS[lower])) {
        runCustomSteps(steps, finalMessage);
        return;
      }

      // Se é um comando embutido
      if (BUILTIN_COMMANDS[lower]) {
        setOutput((prev) => [...prev, ...BUILTIN_COMMANDS[lower]]);
        setCompleted(true);
        return;
      }

      // Comando desconhecido
      setOutput((prev) => [
        ...prev,
        `zsh: comando não encontrado: ${trimmed}. Digite 'help' para ver os comandos.`,
      ]);
      setCompleted(true);
    },
    [promptSymbol, steps, command, finalMessage, runCustomSteps],
  );

  // Auto-scroll sempre que output mudar
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, typing, busy]);

  // Efeito de auto-execução inicial caso ativado
  useEffect(() => {
    if (autoExecute && !typing && output.length === 0 && !busy) {
      const timer = setTimeout(() => {
        setTyping(true);
        setCharIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoExecute, typing, output.length, busy]);

  // Digitação automática de comando quando autoExecute=true
  useEffect(() => {
    if (typing && charIndex < command.length) {
      const timer = setTimeout(() => {
        setInput(command.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingDelay);
      return () => clearTimeout(timer);
    } else if (typing && charIndex === command.length) {
      const timer = setTimeout(() => {
        setTyping(false);
        setInput("");
        handleExecuteCommand(command);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [typing, charIndex, command, typingDelay, handleExecuteCommand]);

  // Efeito de repetição (repeat) para autoExecute
  useEffect(() => {
    if (autoExecute && repeat && completed) {
      const timer = setTimeout(() => {
        resetTerminal();
      }, repeatDelay);
      return () => clearTimeout(timer);
    }
  }, [autoExecute, repeat, completed, resetTerminal, repeatDelay]);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (scriptTimerRef.current) {
        clearInterval(scriptTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !busy) {
      const current = input;
      setInput("");
      handleExecuteCommand(current);
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = busy
    ? { label: "executando", color: "bg-amber-500 dark:bg-amber-400" }
    : completed
      ? { label: "success", color: "bg-emerald-500 dark:bg-emerald-400" }
      : { label: "cold", color: "bg-zinc-400 dark:bg-zinc-500" };

  const lineKind = (line: string) => {
    if (line.startsWith(promptSymbol)) return "command" as const;
    if (
      line.includes("ORDER COMPLETE") ||
      line.includes("successfully") ||
      line.includes("Comandos disponíveis")
    )
      return "success" as const;
    return "step" as const;
  };

  const buttonClasses =
    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-black/60 transition-colors hover:bg-black/10 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <div
      className={cn(
        "group relative w-full font-mono rounded-(--terminal-radius) flex flex-col h-full min-h-0",
        "[--terminal-radius:1rem]",
        t.glow,
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-(--terminal-radius) bg-gradient-to-b flex flex-col flex-1 h-full min-h-0",
          "ring-1 ring-inset",
          t.ring,
          t.surface,
        )}
      >
        {/* scanline + vignette texture */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, color-mix(in srgb, currentColor 6%, transparent) 0px, transparent 1px, transparent 3px)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.08))] dark:bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.5))]" />

        {/* Title bar */}
        <div className="relative z-30 flex items-center justify-between bg-black/[0.04] px-4 py-2.5 dark:bg-black/30">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/20" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/20" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/20" />
          </div>

          <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
            {icon}
            <span className="max-w-28 xs:max-w-36 sm:max-w-none truncate tracking-wide">
              {title}
            </span>
          </div>

          <div className="flex w-fit items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.04] px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider whitespace-nowrap text-black/60 dark:border-white/10 dark:bg-black/30 dark:text-white/60">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              {busy && (
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    status.color,
                  )}
                />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  status.color,
                )}
              />
            </span>
            <span className="hidden xs:inline">{status.label}</span>
          </div>
        </div>

        {/* Command chip row */}
       

        {/* Output area — delimitada e preenchendo 100% da altura com scroll interno */}
        <div
          ref={outputRef}
          className="relative z-10 flex-1 min-h-0 h-full space-y-1 overflow-y-auto px-4 py-3 text-xs sm:text-sm leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {output.length === 0 && !typing && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-black/30 dark:text-white/30 text-center py-6">
              <TerminalIcon className="h-5 w-5 opacity-40" />
              <span className="text-xs">
                Digite{" "}
                <button
                  type="button"
                  onClick={() => handleExecuteCommand("help")}
                  className="font-bold underline text-emerald-500 hover:text-emerald-400 cursor-pointer"
                >
                  help
                </button>{" "}
                {" "}
                {/* <button
                  type="button"
                  onClick={() => handleExecuteCommand("arch")}
                  className="font-bold underline text-emerald-500 hover:text-emerald-400 cursor-pointer"
                >
                  arch
                </button>{" "} */}
                para receber a lista de comandos
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {output.map((line, index) => {
              const kind = lineKind(line);
              return (
                <motion.div
                  key={`${index}-${line.slice(0, 10)}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2"
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {kind === "command" ? (
                      <ChevronRight className={cn("h-3.5 w-3.5", t.accentText)} />
                    ) : kind === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-1.5 w-1.5 translate-y-1.5 text-black/20 dark:text-white/20" />
                    )}
                  </span>
                  <pre
                    className={cn(
                      "whitespace-pre-wrap break-words font-mono text-xs sm:text-sm",
                      kind === "command" &&
                        "font-semibold text-zinc-900 dark:text-white",
                      kind === "step" && "text-zinc-600 dark:text-white/70",
                      kind === "success" &&
                        "font-medium text-emerald-600 dark:text-emerald-300",
                    )}
                  >
                    {kind === "command"
                      ? line.replace(new RegExp(`^\\${promptSymbol}\\s?`), "")
                      : line}
                  </pre>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loader ativo durante scripts demorados */}
          {busy && !typing && (
            <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              executando…
            </div>
          )}

          {/* Digitação simulada */}
          {typing && (
            <div className="flex items-start gap-2">
              <ChevronRight
                className={cn("mt-0.5 h-3.5 w-3.5 flex-shrink-0", t.accentText)}
              />
              <pre className="whitespace-pre-wrap font-semibold text-zinc-900 dark:text-white font-mono text-xs sm:text-sm">
                {input}
                <span
                  className={cn(
                    "ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse",
                    t.accentBg,
                  )}
                />
              </pre>
            </div>
          )}
        </div>

        {/* Form de input interativo — permanece sempre disponível */}
        {!autoExecute && (
          <div className="relative z-30 overflow-hidden border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-black/20">
            <form
              onSubmit={handleSubmit}
              className="m-2 flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-1.5 transition-colors focus-within:border-black/25 dark:border-white/10 dark:bg-black/40 dark:focus-within:border-white/25"
            >
              <span className={cn("font-bold text-xs", t.promptText)}>
                {promptSymbol}
              </span>
              <input
                type="text"
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-black/30 focus:outline-none disabled:opacity-50 dark:text-white dark:placeholder:text-white/25"
                placeholder={inputPlaceholder}
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30",
                  t.accentBg,
                )}
                title="Executar"
              >
                <SendHorizontal className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTerminal;
