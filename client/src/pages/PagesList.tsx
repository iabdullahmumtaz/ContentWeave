import { api } from '../api';

import type { Page } from '../types';

interface PagesListProps {
  pages: Page[];
  onNew: () => void;
  onSelect: (page: Page) => void;
  onDelete: (id: string) => void;
}

export default function PagesList({ pages, onNew, onSelect, onDelete }: PagesListProps) {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Pages</h2>
          <p className="text-slate-400 text-sm mt-1">Manage content with the block builder and markdown editor</p>
        </div>
        <button type="button" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90" onClick={onNew}>
          + New Page
        </button>
      </div>
      <div className="grid gap-3">
        {pages.map((p) => (
          <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4 hover:border-violet-500/30 transition group">
            <button type="button" className="flex-1 text-left" onClick={async () => { const full = await api<Page>(`/api/pages/by-id/${p._id}`); onSelect(full); }}>
              <p className="font-semibold text-white">{p.title}</p>
              <p className="text-sm text-slate-500">/{p.slug}</p>
              <p className="text-xs text-slate-600 mt-1">{p.blocks?.length || 0} blocks</p>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 px-2"
                onClick={(e) => { e.stopPropagation(); if (p._id) onDelete(p._id); }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!pages.length && (
          <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400">Create your first page to get started</p>
            <button type="button" className="mt-4 text-violet-400 text-sm hover:text-violet-300" onClick={onNew}>+ New Page</button>
          </div>
        )}
      </div>
    </main>
  );
}
