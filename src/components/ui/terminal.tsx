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

export type CommandConfig = {
  description?: string;
  steps?: string[];
  output?: string[] | string;
};

export type TerminalCommands = Record<string, CommandConfig | string[]>;

export type TerminalProps = {
  command?: string;
  steps?: string[];
  finalMessage?: string;
  commands?: TerminalCommands;
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
    glow: "shadow-[0_0_30px_-15px_rgba(16,185,129,0.15)]",
    surface:
      "from-emerald-50/70 to-stone-100 text-emerald-700",
    promptText: "text-emerald-600",
    accentText: "text-emerald-500",
    accentBg: "bg-emerald-500",
    ring: "ring-emerald-600/30",
  },
  sky: {
    glow: "shadow-[0_0_30px_-15px_rgba(56,189,248,0.15)]",
    surface:
      "from-sky-50/70 to-stone-100 text-sky-700",
    promptText: "text-sky-600",
    accentText: "text-sky-500",
    accentBg: "bg-sky-500",
    ring: "ring-sky-600/30",
  },
  synthwave: {
    glow: "shadow-[0_0_30px_-15px_rgba(217,70,239,0.15)]",
    surface:
      "from-fuchsia-50/70 to-stone-100 text-fuchsia-700",
    promptText: "text-fuchsia-600",
    accentText: "text-fuchsia-500",
    accentBg: "bg-fuchsia-500",
    ring: "ring-fuchsia-600/30",
  },
  retro: {
    glow: "shadow-[0_0_30px_-15px_rgba(245,158,11,0.15)]",
    surface:
      "from-amber-50/70 to-stone-100 text-amber-700",
    promptText: "text-amber-600",
    accentText: "text-amber-500",
    accentBg: "bg-amber-500",
    ring: "ring-amber-600/40",
  },
};

export const DEFAULT_COMMANDS: Record<string, CommandConfig> = {
  help: {
    description: "Mostra esta lista de ajuda",
    output: [
      "Comandos disponíveis:",
      "  arch       - Informações do sistema ArchLinux",
      "  sobre      - Sobre o desenvolvedor Isaac",
      "  cafe       - Prepara um café quentinho",
      "  clear      - Limpa a tela do terminal",
    ],
  },
  arch: {
    description: "Informações do sistema Arch Linux",
    steps: [
      "Iniciando diagnóstico do sistema...",
      "Detectando arquitetura de hardware (x86_64)...",
      "Consultando módulos do kernel Linux 6.12...",
      "Carregando compositor Hyprland / Wayland...",
      "Gerando informações do sistema...",
    ],
    output: [
      "Informações do sistema carregadas:",
      "       /\\         OS: Arch Linux x86_64",
      "      /  \\        Kernel: 6.12.1-arch1-1",
      "     /\\   \\       Shell: zsh 5.9",
      "    /      \\      WM: Hyprland / Wayland",
      "   /   ,,   \\     Terminal: fish",
      "  /   |  |  -\\    Editor: VS Code / IntelliJ",
      " /_-''    ''-_\\   User: isawc",
    ],
  },
  sobre: {
    description: "Sobre o desenvolvedor Isaac",
    steps: [
      "Acessando base de dados biográfica...",
      "Carregando formação acadêmica (UNIVESP)...",
      "Indexando stack técnica e definindo capacidades...",
      "Compilando perfil de desenvolvedor...",
    ],
    output: [
      "PERFIL DEV CARREGADO: ",
      "Isaac Machado — Engenheiro de Computação & Full-Stack Developer",
      "- Cristão",
      "- Capaz de criar aplicações multiplataformas criativas completas",
      "- I use archlinux btw",
    ],
  },
  about: {
    description: "About the developer Isaac",
    steps: [
      "Accessing biographical database...",
      "Loading academic credentials (UNIVESP)...",
      "Indexing tech stack and skills...",
      "Compiling developer profile...",
    ],
    output: [
      "DEV PROFILE LOADED: ",
      "Isaac Machado — Computer Engineer & Full-Stack Developer",
      "- Christian",
      "- Capable of creating creative cross-platform applications",
      "- I use archlinux btw",
    ],
  },
  cafe: {
    description: "Prepara um café quentinho",
    steps: [
      "Recebendo pedido de café...",
      "Moendo grãos frescos selecionados...",
      "Aquecendo água a 90°C...",
      "Extraindo o café...",
      "Adoçando o café...",
    ],
    output: [
      "PEDIDO FINALIZADO!",
      "Seu café está pronto:",
      "☕  - Café pilão já adoçado",
      "Aproveite seu café e tenha um excelente dia!",
    ],
  },
  coffee: {
    description: "Brew a fresh coffee",
    steps: [
      "Taking your order...",
      "Grinding fresh beans...",
      "Heating water to 194°F...",
      "Extracting coffee...",
      "Adding sweetener...",
    ],
    output: [
      "ORDER COMPLETE!",
      "Your perfect coffee is ready:",
      "☕ - Coffee pilão already sweetened",
      "Enjoy your coffee and have a wonderful day!",
    ],
  },
  brew: {
    description: "Brew a fresh coffee",
    steps: [
      "Taking your order...",
      "Grinding fresh beans...",
      "Heating water to 194°F...",
      "Extracting coffee...",
      "Adding sweetener...",
    ],
    output: [
      "ORDER COMPLETE! ",
      "Your perfect coffee is ready:",
      "☕ - Coffee pilão already sweetened",
      "Enjoy your coffee and have a wonderful day!",
    ],
  },
};

export const BUILTIN_COMMANDS = DEFAULT_COMMANDS;

export type OutputKind = "command" | "step" | "output" | "success" | "error";

export type OutputLine = {
  id: string;
  text: string;
  kind: OutputKind;
};

const InteractiveTerminal: React.FC<TerminalProps> = ({
  command = "help",
  steps,
  finalMessage,
  commands,
  stepDelay = 2000,
  typingDelay = 80,
  icon = <TerminalIcon className="h-4 w-4" />,
  promptSymbol = ">",
  inputPlaceholder = "Digite o comando...",
  autoExecute = false,
  repeat = false,
  repeatDelay = 3000,
  className,
  title = "zsh — 80×24",
  variant = "default",
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([]);
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

  const runCustomSteps = useCallback(
    (customSteps: string[], finalMsg?: string[] | string) => {
      setBusy(true);
      setCompleted(false);
      let stepIndex = 0;

      if (scriptTimerRef.current) {
        clearInterval(scriptTimerRef.current);
      }

      scriptTimerRef.current = setInterval(() => {
        if (stepIndex < customSteps.length) {
          const currentStep = customSteps[stepIndex];
          setOutput((prev) => [
            ...prev,
            {
              id: `${Date.now()}-step-${stepIndex}-${Math.random().toString(36).slice(2, 6)}`,
              text: currentStep,
              kind: "step",
            },
          ]);
          stepIndex++;
        } else {
          if (scriptTimerRef.current) {
            clearInterval(scriptTimerRef.current);
            scriptTimerRef.current = null;
          }
          if (finalMsg) {
            const outputs = Array.isArray(finalMsg) ? finalMsg : [finalMsg];
            const newLines: OutputLine[] = outputs.map((out, idx) => {
              const isSuccess =
                out.includes("PEDIDO FINALIZADO") ||
                out.includes("Informações do sistema carregadas") ||
                out.includes("ORDER COMPLETE") ||
                out.includes("PERFIL DEV CARREGADO") ||
                out.includes("DEV PROFILE LOADED") ||
                out.includes("successfully") ||
                out.includes("Comandos disponíveis");
              return {
                id: `${Date.now()}-out-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                text: out,
                kind: isSuccess ? "success" : "output",
              };
            });
            setOutput((prev) => [...prev, ...newLines]);
          }
          setBusy(false);
          setCompleted(true);
        }
      }, stepDelay);
    },
    [stepDelay],
  );

  const handleExecuteCommand = useCallback(
    (cmdText: string) => {
      const trimmed = cmdText.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();

      if (lower === "clear" || lower === "cls") {
        if (scriptTimerRef.current) {
          clearInterval(scriptTimerRef.current);
          scriptTimerRef.current = null;
        }
        setOutput([]);
        setBusy(false);
        setCompleted(true);
        return;
      }

      // Add command to output
      setOutput((prev) => [
        ...prev,
        {
          id: `${Date.now()}-cmd-${Math.random().toString(36).slice(2, 6)}`,
          text: trimmed,
          kind: "command",
        },
      ]);

      const activeCommands = { ...DEFAULT_COMMANDS, ...commands };
      const matchedCmd = activeCommands[lower];

      // "help" doesn't need steps!
      if (lower === "help") {
        const helpOutput = matchedCmd
          ? Array.isArray(matchedCmd)
            ? matchedCmd
            : matchedCmd.output
          : DEFAULT_COMMANDS.help.output;

        const outputs = Array.isArray(helpOutput) ? helpOutput : [helpOutput || ""];
        const newLines: OutputLine[] = outputs.map((out, idx) => ({
          id: `${Date.now()}-help-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          text: out,
          kind: out.includes("Comandos disponíveis") ? "success" : "output",
        }));

        setOutput((prev) => [...prev, ...newLines]);
        setCompleted(true);
        return;
      }

      if (matchedCmd) {
        const cmdConfig = Array.isArray(matchedCmd)
          ? { output: matchedCmd, steps: undefined }
          : matchedCmd;

        const cmdSteps =
          cmdConfig.steps && cmdConfig.steps.length > 0
            ? cmdConfig.steps
            : steps && steps.length > 0
              ? steps
              : undefined;

        const cmdOutput = cmdConfig.output ?? finalMessage;

        if (cmdSteps && cmdSteps.length > 0) {
          runCustomSteps(cmdSteps, cmdOutput);
          return;
        }

        if (cmdOutput) {
          const outputs = Array.isArray(cmdOutput) ? cmdOutput : [cmdOutput];
          const newLines: OutputLine[] = outputs.map((out, idx) => {
            const isSuccess =
              out.includes("ORDER COMPLETE") ||
              out.includes("DEV PROFILE LOADED") ||
              out.includes("successfully") ||
              out.includes("Comandos disponíveis");
            return {
              id: `${Date.now()}-out-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              text: out,
              kind: isSuccess ? "success" : "output",
            };
          });
          setOutput((prev) => [...prev, ...newLines]);
          setCompleted(true);
          return;
        }
      }

      if (steps && steps.length > 0 && lower === command.toLowerCase()) {
        runCustomSteps(steps, finalMessage);
        return;
      }

      setOutput((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err-${Math.random().toString(36).slice(2, 6)}`,
          text: `zsh: comando não encontrado: ${trimmed}. Digite 'help' para ver os comandos.`,
          kind: "error",
        },
      ]);
      setCompleted(true);
    },
    [steps, command, finalMessage, commands, runCustomSteps],
  );

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, typing, busy]);

  useEffect(() => {
    if (autoExecute && !typing && output.length === 0 && !busy) {
      const timer = setTimeout(() => {
        setTyping(true);
        setCharIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoExecute, typing, output.length, busy]);

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

  useEffect(() => {
    if (autoExecute && repeat && completed) {
      const timer = setTimeout(() => {
        resetTerminal();
      }, repeatDelay);
      return () => clearTimeout(timer);
    }
  }, [autoExecute, repeat, completed, resetTerminal, repeatDelay]);

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
    ? { label: "Executando", color: "bg-amber-500" }
    : completed
      ? { label: "success", color: "bg-emerald-500" }
      : { label: "cold", color: "bg-zinc-400" };

  return (
    <div
      className={cn(
        "group relative w-full font-mono rounded-(--terminal-radius) flex flex-col h-full min-h-0",
        "[--terminal-radius:2px]",
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
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, color-mix(in srgb, currentColor 6%, transparent) 0px, transparent 1px, transparent 3px)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.08))]" />

        <div className="relative z-30 flex items-center justify-between bg-black/[0.04] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/20" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/20" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/20" />
          </div>

          <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-xs text-black/80">
            {icon}
            <span className="max-w-28 xs:max-w-36 sm:max-w-none truncate tracking-wide">
              {title}
            </span>
          </div>

          <div className="flex w-fit items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.04] px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider whitespace-nowrap text-black/60">
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

        <div
          ref={outputRef}
          className="relative z-10 flex-1 min-h-0 h-full space-y-1 overflow-y-auto px-4 py-3 text-xs sm:text-sm leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {output.length === 0 && !typing && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-black/50 text-center py-6">
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
                para receber a lista de comandos
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {output.map((item) => {
              const kind = item.kind;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2"
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {kind === "command" ? (
                      <ChevronRight className={cn("h-3.5 w-3.5", t.accentText)} />
                    ) : kind === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : kind === "error" ? (
                      <Circle className="h-1.5 w-1.5 translate-y-1.5 text-rose-500 fill-rose-500" />
                    ) : kind === "step" ? (
                      <Circle className="h-1.5 w-1.5 translate-y-1.5 text-black/40 fill-black/20" />
                    ) : (
                      <span className="inline-block w-3.5" />
                    )}
                  </span>
                  <pre
                    className={cn(
                      "whitespace-pre-wrap break-words font-mono text-xs sm:text-sm",
                      kind === "command" && "font-semibold text-zinc-900",
                      kind === "step" && "text-zinc-600",
                      kind === "output" && "text-zinc-800",
                      kind === "success" && "font-medium text-emerald-600",
                      kind === "error" && "font-medium text-rose-600",
                    )}
                  >
                    {item.text}
                  </pre>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {busy && !typing && (
            <div className="flex items-center gap-2 text-xs text-black/50 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Executando…
            </div>
          )}

          {typing && (
            <div className="flex items-start gap-2">
              <ChevronRight
                className={cn("mt-0.5 h-3.5 w-3.5 flex-shrink-0", t.accentText)}
              />
              <pre className="whitespace-pre-wrap font-semibold text-zinc-900 font-mono text-xs sm:text-sm">
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

        {!autoExecute && (
          <div className="relative z-30 overflow-hidden border-t border-black/5 bg-black/[0.02]">
            <form
              onSubmit={handleSubmit}
              className="m-2 flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-1.5 transition-colors focus-within:border-black/25"
            >
              <span className={cn("font-bold text-xs", t.promptText)}>
                {promptSymbol}
              </span>
              <input
                type="text"
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-black/50 focus:outline-none disabled:opacity-50"
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
