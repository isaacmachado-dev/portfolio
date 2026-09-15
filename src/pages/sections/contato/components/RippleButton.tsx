import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useRipple } from "use-ripple-hook";

export default function ContatoRippleButton() {
  const [copied, setCopied] = useState(false);
  const [ripple, event] = useRipple({
    color: "rgba(12, 11, 12, 0.15)",
  });
  const email = "contato@isaacmachado.com.br";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <span
        id="copied-badge"
        className={`absolute -top-8 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-ink shadow-md transition-all duration-300 ${
          copied
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none translate-y-1"
        }`}
      >
        E-mail copiado!
      </span>

      <button
        id="contatoRippleButton"
        type="button"
        ref={ripple}
        onPointerDown={event}
        onClick={handleCopy}
        className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-tertiary px-6 py-3 text-base sm:text-lg  text-ink transition-all hover:bg-neutral-strong active:scale-95 shadow-md cursor-pointer select-none font-fraunces"
      >
        <span>{email}</span>

        {copied ? (
          <Check className="w-4 h-4 text-ink" />
        ) : (
          <Copy className="w-4 h-4 text-ink opacity-70" />
        )}
      </button>
    </div>
  );
}

export { ContatoRippleButton, ContatoRippleButton as contatoRippleButton, ContatoRippleButton as RippleButton };
