"use client";

import React, { useState } from "react";
import { 
  Folder, 
  Play, 
  Trash2, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Clock,
  Music
} from "lucide-react";
import { useStudioStore, ProjectSummary } from "@/stores/useStudioStore";

export function LibraryTab() {
  const { 
    savedProjects, 
    loadProject, 
    deleteProject, 
    createNewProject, 
    setCurrentView,
    setIsCreateSheetOpen 
  } = useStudioStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vocal" | "beat" | "studio">("all");

  const filteredProjects = savedProjects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenProject = (id: string) => {
    loadProject(id);
    setCurrentView("studio");
  };

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-brand" />
          <span className="text-xs font-mono font-bold text-chalk uppercase tracking-wider">
            My Projects Library ({savedProjects.length})
          </span>
        </div>

        <button
          onClick={() => setIsCreateSheetOpen(true)}
          className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Track</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slateMuted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter projects by title..."
          className="w-full bg-surface-1 border border-surface-border text-chalk text-xs font-mono pl-9 pr-3 py-2 outline-none focus:border-brand transition placeholder:text-slateMuted"
        />
      </div>

      {/* Projects List */}
      <div className="space-y-2">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center bg-surface-1 border border-surface-border space-y-2">
            <p className="text-xs font-mono text-slateMuted">
              No projects found. Start creating your music now!
            </p>
            <button
              onClick={() => setIsCreateSheetOpen(true)}
              className="px-4 py-1.5 bg-brand text-surface-0 text-xs font-mono font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-3.5 bg-surface-1 border border-surface-border hover:border-surface-strong transition flex items-center justify-between gap-3"
            >
              <div
                onClick={() => handleOpenProject(project.id)}
                className="flex-1 cursor-pointer truncate space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-chalk hover:text-brand transition truncate">
                    {project.name}
                  </span>
                  <span className="text-[9px] font-mono text-slateMuted px-1.5 py-0.2 bg-surface-0 border border-surface-border">
                    {project.updatedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-steel">
                  <span>{project.trackCount} Tracks</span>
                  <span>•</span>
                  <span>{project.bpm} BPM</span>
                  <span>•</span>
                  <span>{project.key}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono transition flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 text-brand" />
                  <span>Open Studio</span>
                </button>

                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-1.5 text-slateMuted hover:text-audio-rec transition"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
