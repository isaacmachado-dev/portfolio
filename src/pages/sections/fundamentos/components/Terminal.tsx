import InteractiveTerminal, {
  DEFAULT_COMMANDS,
  type CommandConfig,
  type TerminalCommands,
  type TerminalProps,
} from "@/components/ui/terminal";
import { Coffee } from "lucide-react";

export function TerminalDemo2() {
  return (
    <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
      <InteractiveTerminal
        command="brew --coffee latte"
        icon={<Coffee className="size-4" />}
        variant="retro"
        steps={[
          "Taking your order...",
          "Grinding fresh beans...",
          "Heating water to 93°C...",
          "Extracting espresso shot...",
          "Steaming milk to perfection...",
          "Adding artistic foam design...",
        ]}
        finalMessage={`☕ ORDER COMPLETE! ☕
  
Your perfect latte is ready:
- Double shot espresso (Ethiopian beans)
- Silky steamed oat milk
- Artisanal foam leaf pattern
  
Enjoy your coffee and have a wonderful day!
              `}
        stepDelay={1200}
        promptSymbol="☕"
      />
    </div>
  );
}

export function FundamentosTerminal(props: TerminalProps) {
  return (
    <InteractiveTerminal
      title="isaac@arch"
      inputPlaceholder="Escreva o comando..)"
      stepDelay={400}
      {...props}
    />
  );
}

export default FundamentosTerminal;
export { DEFAULT_COMMANDS, InteractiveTerminal, FundamentosTerminal as Terminal };
export type { CommandConfig, TerminalCommands, TerminalProps };

