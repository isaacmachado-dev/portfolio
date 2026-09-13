import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ProjectFilter from "./ProjectFilter";

export interface AccordionItem {
  title: string;
  content: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  tag?: string;
  tags?: string[];
  image: string;
  imageSrc: string;
  alt?: string;
  height?: number;
  alignment?: "left" | "right";
  accordions?: AccordionItem[];
}

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

function ProjectAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-[400px] mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] bg-white flex flex-row text-black justify-between p-3 cursor-pointer select-none items-center hover:bg-neutral-100 transition-colors"
      >
        <span className="font-medium text-sm sm:text-base text-left">{title}</span>
        <span className="shrink-0 ml-2">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-white p-3 sm:p-4 text-xs sm:text-sm font-space-grotesk text-black border-t border-neutral-200">
          {children}
        </div>
      )}
    </div>
  );
}

function ProjectFrame({
  imageSrc,
  alt = "",
  width = 720,
  height = 360,
}: {
  imageSrc: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className="relative w-full max-w-[720px] p-4 sm:p-6 mt-6 lg:mt-10">
      <div>
        {/* Canto Superior Esquerdo */}
        <span className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 sm:border-t-8 border-l-4 sm:border-l-8 border-white pointer-events-none" />

        {/* Canto Superior Direito */}
        <span className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 sm:border-t-8 border-r-4 sm:border-r-8 border-white pointer-events-none" />

        {/* Canto Inferior Esquerdo */}
        <span className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 sm:border-b-8 border-l-4 sm:border-l-8 border-white pointer-events-none" />

        {/* Canto Inferior Direito */}
        <span className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 sm:border-b-8 border-r-4 sm:border-r-8 border-white pointer-events-none" />

        {/* Imagem */}
        <div className="overflow-hidden">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={alt || ""}
              width={width}
              height={height}
              className="block w-full h-auto max-h-[420px] object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeTab, setActiveTab] = useState("destaques");

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "todos") return true;

    const rawTags = project.tags || (project.tag ? [project.tag] : []);
    const normalizedTags = rawTags.map((t) => String(t).toLowerCase().trim());

    if (activeTab === "destaques") {
      return normalizedTags.includes("destaques") || normalizedTags.includes("destaque");
    }
    if (activeTab === "reais") {
      return (
        normalizedTags.includes("reais") ||
        normalizedTags.includes("projetos reais") ||
        normalizedTags.includes("real")
      );
    }
    if (activeTab === "estudos") {
      return (
        normalizedTags.includes("estudos") ||
        normalizedTags.includes("casos de estudo") ||
        normalizedTags.includes("estudo")
      );
    }
    return normalizedTags.includes(activeTab);
  });

  return (
    <div className="w-full flex flex-col">
      {/* Filtros de Projetos */}
      <div className="w-full px-2 sm:px-0 lg:ml-[4.27%]">
        <ProjectFilter activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Lista de Projetos */}
      <div className="px-2 sm:px-6 lg:p-16 gap-14 sm:gap-20 flex flex-col min-h-[450px] mx-auto w-full max-w-7xl">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => {
            const isImageLeft = project.alignment
              ? project.alignment === "left"
              : index % 2 === 0;

            return (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex flex-col lg:flex-row items-center lg:items-start w-full ${
                  index > 0 ? "mt-12 sm:mt-16 lg:mt-20" : ""
                }`}
              >
                {/* Imagem Desktop quando à esquerda */}
                {isImageLeft && (
                  <div className="hidden lg:block shrink-0">
                    <ProjectFrame
                      imageSrc={project.imageSrc}
                      alt={project.alt || project.title}
                      height={project.height ?? 368}
                    />
                  </div>
                )}

                {/* Imagem Mobile */}
                <div className="block lg:hidden w-full flex justify-center">
                  <ProjectFrame
                    imageSrc={project.imageSrc}
                    alt={project.alt || project.title}
                    height={project.height ?? 360}
                  />
                </div>

                {/* Informações do Projeto */}
                <div
                  className={`mt-6 lg:mt-10 w-full max-w-lg lg:max-w-none ${
                    isImageLeft ? "lg:ml-20" : "lg:mr-20"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-fraunces font-extrabold text-white/90">
                    {project.id}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-space-grotesk text-white break-words mt-1">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-neutral font-space-mono mt-1">
                    {project.category}
                  </p>

                  <div className="w-full mt-2">
                    {project.accordions?.map((accordion, accIdx) => (
                      <ProjectAccordion key={accIdx} title={accordion.title}>
                        {accordion.content}
                      </ProjectAccordion>
                    ))}
                  </div>
                </div>

                {/* Imagem Desktop quando à direita */}
                {!isImageLeft && (
                  <div className="hidden lg:block shrink-0">
                    <ProjectFrame
                      imageSrc={project.imageSrc}
                      alt={project.alt || project.title}
                      height={project.height ?? 360}
                    />
                  </div>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center text-muted font-space-mono text-base sm:text-lg"
          >
            Nenhum projeto encontrado nesta categoria.
          </motion.div>
        )}
      </div>
    </div>
  );
}
