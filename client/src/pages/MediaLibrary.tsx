import { api, uploadMedia } from '../api';

import type { ChangeEvent } from 'react';
import type { MediaItem } from '../types';

interface MediaLibraryProps {
  items: MediaItem[];
  onRefresh: () => void;
}

export default function MediaLibrary({ items, onRefresh }: MediaLibraryProps) {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await uploadMedia(f);
    onRefresh();
    e.target.value = '';
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <p className="text-slate-400 text-sm mt-1">Upload assets and insert them into page blocks</p>
        </div>
        <label className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:opacity-90">
          Upload file
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((m) => (
          <div key={m._id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group">
            {m.mimeType?.startsWith('image/') ? (
              <img src={m.url} alt={m.originalName} className="h-36 w-full object-cover" />
            ) : (
              <div className="h-36 bg-slate-800 flex items-center justify-center text-4xl">📄</div>
            )}
            <div className="p-3">
              <p className="text-xs text-white truncate">{m.originalName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.mimeType}</p>
              <button
                type="button"
                className="w-full mt-2 text-rose-400 text-xs py-1 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded"
                onClick={async () => { await api(`/api/media/${m._id}`, { method: 'DELETE' }); onRefresh(); }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {!items.length && (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-400">No media yet — upload your first file</p>
        </div>
      )}
    </main>
  );
}
