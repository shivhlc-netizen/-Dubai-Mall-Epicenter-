'use client';

import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: 'ongoing' | 'completed' | 'backlog';
  category: 'Retail' | 'Infrastructure' | 'Event' | 'Security';
  assignee: string;
  deadline: string;
}

const INITIAL_PROJECTS: Project[] = [
  { id: '1', title: 'Luxury Wing Expansion', status: 'ongoing', category: 'Retail', assignee: 'Sarah J.', deadline: '2026-06-15' },
  { id: '2', title: 'Solar Grid Sync', status: 'completed', category: 'Infrastructure', assignee: 'Mike R.', deadline: '2026-04-10' },
  { id: '3', title: 'NYE Prep 2027', status: 'backlog', category: 'Event', assignee: 'Alex V.', deadline: '2026-12-01' },
  { id: '4', title: 'Biometric Access v4', status: 'ongoing', category: 'Security', assignee: 'David L.', deadline: '2026-05-20' },
  { id: '5', title: 'New Fountain Show', status: 'ongoing', category: 'Infrastructure', assignee: 'Emma W.', deadline: '2026-07-01' },
];

export default function ProjectBoard() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);

  const columns = [
    { id: 'backlog', label: 'Backlog', icon: AlertCircle, color: 'text-white/40' },
    { id: 'ongoing', label: 'Ongoing', icon: Clock, color: 'text-gold' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gold" />
          <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Epicenter Project Stream</h2>
        </div>
        <button className="text-[10px] tracking-widest uppercase bg-gold/10 text-gold px-3 py-1.5 border border-gold/20 hover:bg-gold hover:text-black transition-all">
          New Project +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col bg-white/[0.02] border border-white/5 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <col.icon size={14} className={col.color} />
                <span className="text-[11px] uppercase tracking-widest font-bold text-white/70">{col.label}</span>
              </div>
              <span className="text-[10px] text-white/20 font-mono">
                {projects.filter(p => p.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {projects.filter(p => p.status === col.id).map(project => (
                <motion.div
                  key={project.id}
                  layoutId={project.id}
                  className="bg-[#0f0f0f] border border-white/5 p-4 rounded-sm hover:border-gold/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 bg-white/5 text-white/40 rounded-full">
                      {project.category}
                    </span>
                    <MoreVertical size={12} className="text-white/10 group-hover:text-white/40" />
                  </div>
                  <h3 className="text-xs font-sans text-white/80 group-hover:text-white mb-3 leading-relaxed">
                    {project.title}
                  </h3>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-[8px] text-gold font-bold">
                         {project.assignee.split(' ').map(n => n[0]).join('')}
                       </div>
                       <span className="text-[9px] text-white/20">{project.assignee}</span>
                    </div>
                    <span className="text-[9px] text-white/20 font-mono italic">{project.deadline}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
