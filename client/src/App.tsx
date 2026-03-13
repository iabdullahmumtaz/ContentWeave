import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { MediaItem, Page, User } from './types';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import PagesList from './pages/PagesList';
import PageBuilder from './pages/PageBuilder';
import MediaLibrary from './pages/MediaLibrary';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'pages', label: 'Pages', icon: '📄' },
  { id: 'media', label: 'Media', icon: '🖼' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<Page | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPages = useCallback(async () => {
    setPages(await api<Page[]>('/api/pages'));
  }, []);

  const loadMedia = useCallback(async () => {
    setMedia(await api<MediaItem[]>('/api/media'));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('weave_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api<User>('/api/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('weave_token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      loadPages();
      loadMedia();
    }
  }, [user, loadPages, loadMedia]);

  const savePage = async (data: Partial<Page>) => {
    if (selected?._id) {
      const updated = await api<Page>(`/api/pages/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSelected(updated);
    } else {
      const created = await api<Page>('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSelected(created);
    }
    loadPages();
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    await api(`/api/pages/${id}`, { method: 'DELETE' });
    if (selected?._id === id) {
      setSelected(null);
      setView('pages');
    }
    loadPages();
  };

  const newPage = () => {
    setSelected({ title: 'New Page', slug: `page-${Date.now()}`, blocks: [], status: 'draft' });
    setView('editor');
  };

  const navigate = (id: string) => {
    setView(id);
    if (id !== 'editor') setSelected(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">CW</div>
            <div>
              <h1 className="font-bold text-sm">ContentWeave</h1>
              <p className="text-[10px] text-slate-500">CMS Admin</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link w-full ${view === item.id || (item.id === 'pages' && view === 'editor') ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
          <button
            type="button"
            className="mt-2 text-xs text-slate-500 hover:text-white"
            onClick={() => { localStorage.removeItem('weave_token'); setUser(null); }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {view === 'dashboard' && (
        <Dashboard pages={pages} media={media} user={user} onNavigate={navigate} />
      )}

      {view === 'pages' && !selected && (
        <PagesList pages={pages} onNew={newPage} onSelect={(p) => { setSelected(p); setView('editor'); }} onDelete={deletePage} />
      )}

      {view === 'editor' && selected && (
        <PageBuilder
          page={selected}
          onSave={savePage}
          onBack={() => { setSelected(null); setView('pages'); }}
          media={media}
        />
      )}

      {view === 'media' && <MediaLibrary items={media} onRefresh={loadMedia} />}
    </div>
  );
}
