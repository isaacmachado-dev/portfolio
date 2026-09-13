import { motion } from "motion/react";

interface ProjectFilterProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export default function ProjectFilter({ activeTab, onSelectTab }: ProjectFilterProps) {
  const tabs = [
    { id: "destaques", label: "Destaques" },
    { id: "reais", label: "Projetos reais" },
    { id: "estudos", label: "Casos de estudo" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <div className="relative mt-6 w-full max-w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className="inline-flex items-center gap-1 sm:gap-2 bg-white border border-black p-1 sm:p-1.5 md:p-2 font-sans select-none min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative z-10 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 font-bold text-xs sm:text-sm md:text-base lg:text-lg transition-colors duration-200 cursor-pointer ${
                isActive ? "text-white" : "text-ink hover:opacity-75"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilterPill"
                  className="absolute inset-0 bg-ink z-[-1] pointer-events-none"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}