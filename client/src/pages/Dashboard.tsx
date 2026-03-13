import type { MediaItem, Page, User } from '../types';

interface DashboardProps {
  pages: Page[];
  media: MediaItem[];
  user: User;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ pages, media, user, onNavigate }: DashboardProps) {
  const published = pages.filter((p) => p.status === 'published').length;
  const drafts = pages.filter((p) => p.status === 'draft').length;
  const images = media.filter((m) => m.mimeType?.startsWith('image/')).length;

  const stats = [
    { label: 'Total pages', value: pages.length, color: 'from-violet-500 to-purple-600', action: 'pages' },
    { label: 'Published', value: published, color: 'from-emerald-500 to-teal-600', action: 'pages' },
    { label: 'Drafts', value: drafts, color: 'from-amber-500 to-orange-600', action: 'pages' },
    { label: 'Media assets', value: media.length, color: 'from-fuchsia-500 to-pink-600', action: 'media' },
  ];

  const features = [
    { title: 'Page builder', desc: 'Drag-reorder blocks: Hero, Text, Image, CTA, Markdown', icon: '🧩', action: 'pages' },
    { title: 'Markdown editor', desc: 'Split-pane editor with live preview', icon: '📝', action: 'pages' },
    { title: 'Media library', desc: 'Upload images and insert into pages', icon: '🖼️', action: 'media' },
    { title: 'Headless API', desc: 'Publish pages and fetch by slug via REST', icon: '🔌', action: null },
  ];

  return (
    <main className="flex-1 p-6 overflow-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}
          {user?.role && <span className="ml-2 text-violet-400 capitalize">({user.role})</span>}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => s.action && onNavigate(s.action)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left hover:border-violet-500/40 transition group"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
          </button>
        ))}
      </div>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Platform features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-slate-900 border border-slate-800 rounded-xl p-5 ${f.action ? 'cursor-pointer hover:border-violet-500/40' : ''}`}
              onClick={() => f.action && onNavigate(f.action)}
              onKeyDown={(e) => e.key === 'Enter' && f.action && onNavigate(f.action)}
              role={f.action ? 'button' : undefined}
              tabIndex={f.action ? 0 : undefined}
            >
              <span className="text-2xl">{f.icon}</span>
              <h4 className="font-semibold text-white mt-3">{f.title}</h4>
              <p className="text-slate-400 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Recent pages</h3>
            <button type="button" className="text-xs text-violet-400 hover:text-violet-300" onClick={() => onNavigate('pages')}>View all</button>
          </div>
          {pages.slice(0, 5).map((p) => (
            <div key={p._id} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
              <div>
                <p className="text-sm text-white font-medium">{p.title}</p>
                <p className="text-xs text-slate-500">/{p.slug}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
            </div>
          ))}
          {!pages.length && <p className="text-slate-500 text-sm">No pages yet — create your first page.</p>}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Media library</h3>
            <button type="button" className="text-xs text-violet-400 hover:text-violet-300" onClick={() => onNavigate('media')}>Open library</button>
          </div>
          <p className="text-3xl font-bold text-white">{media.length}</p>
          <p className="text-slate-400 text-sm mt-1">{images} images · {media.length - images} other files</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {media.slice(0, 4).map((m) => (
              m.mimeType?.startsWith('image/') ? (
                <img key={m._id} src={m.url} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
              ) : (
                <div key={m._id} className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-lg">📄</div>
              )
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
