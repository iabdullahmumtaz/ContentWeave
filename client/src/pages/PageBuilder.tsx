import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BLOCK_TYPES, BlockPreview, createBlock } from '../blocks';
import type { MediaItem, Page, PageBlock } from '../types';

const inputClass = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-violet-500 focus:outline-none';

interface BlockEditorProps {
  block: PageBlock;
  onChange: (block: PageBlock) => void;
}

function BlockEditor({ block, onChange }: BlockEditorProps) {
  const c = (block.content || {}) as Record<string, string>;
  const set = (key: string, val: string) => onChange({ ...block, content: { ...c, [key]: val } });

  if (block.type === 'hero') {
    return (
      <div className="space-y-2 text-sm">
        <input className={inputClass} value={c.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Headline" />
        <input className={inputClass} value={c.subline} onChange={(e) => set('subline', e.target.value)} placeholder="Subline" />
        <select className={inputClass} value={c.align || 'center'} onChange={(e) => set('align', e.target.value)}>
          <option value="center">Center align</option>
          <option value="left">Left align</option>
        </select>
      </div>
    );
  }
  if (block.type === 'text') {
    return <textarea className={inputClass} rows={3} value={c.body} onChange={(e) => set('body', e.target.value)} />;
  }
  if (block.type === 'image') {
    return (
      <div className="space-y-2 text-sm">
        <input className={inputClass} value={c.src} onChange={(e) => set('src', e.target.value)} placeholder="Image URL" />
        <input className={inputClass} value={c.alt} onChange={(e) => set('alt', e.target.value)} placeholder="Alt text" />
        <input className={inputClass} value={c.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="Caption" />
      </div>
    );
  }
  if (block.type === 'cta') {
    return (
      <div className="space-y-2 text-sm">
        <input className={inputClass} value={c.text} onChange={(e) => set('text', e.target.value)} placeholder="Button text" />
        <input className={inputClass} value={c.href} onChange={(e) => set('href', e.target.value)} placeholder="Link URL" />
      </div>
    );
  }
  if (block.type === 'markdown') {
    return <textarea className={`${inputClass} font-mono text-xs`} rows={5} value={c.source} onChange={(e) => set('source', e.target.value)} />;
  }
  return null;
}

interface PageBuilderProps {
  page: Page;
  onSave: (data: Partial<Page>) => void;
  onBack: () => void;
  media: MediaItem[];
}

export default function PageBuilder({ page, onSave, onBack, media }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(page?.blocks || []);
  const [title, setTitle] = useState(page?.title || 'Untitled');
  const [slug, setSlug] = useState(page?.slug || '');
  const [status, setStatus] = useState(page?.status || 'draft');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [markdownBody, setMarkdownBody] = useState(page?.markdownBody || '');
  const [tab, setTab] = useState('builder');

  useEffect(() => {
    setBlocks(page?.blocks || []);
    setTitle(page?.title || 'Untitled');
    setSlug(page?.slug || '');
    setStatus(page?.status || 'draft');
    setMarkdownBody(page?.markdownBody || '');
  }, [page?._id]);

  const addBlock = (type: PageBlock['type']) => setBlocks((b) => [...b, createBlock(type)]);

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setBlocks(next);
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx !== null) moveBlock(dragIdx, i);
    setDragIdx(null);
  };

  const insertMedia = (url: string) => {
    const img = createBlock('image');
    img.content.src = url;
    setBlocks((b) => [...b, img]);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center gap-3 flex-wrap">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Pages</button>
        <input
          className="text-xl font-semibold bg-transparent border-b border-transparent focus:border-violet-500 outline-none flex-1 min-w-[12rem] text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input className={`${inputClass} w-44`} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          type="button"
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          onClick={() => onSave({ title, slug, blocks, markdownBody, status })}
        >
          Save
        </button>
      </header>

      <div className="flex border-b border-slate-800 text-sm bg-slate-900">
        {['builder', 'markdown', 'preview'].map((t) => (
          <button
            key={t}
            type="button"
            className={`px-4 py-2.5 capitalize ${tab === t ? 'border-b-2 border-violet-500 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-950">
        {tab === 'builder' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  type="button"
                  className="text-xs border border-violet-500/30 bg-slate-900 text-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-500/20"
                  onClick={() => addBlock(bt.type)}
                >
                  + {bt.label}
                </button>
              ))}
            </div>
            {blocks.map((block, i) => (
              <div
                key={block.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="bg-slate-900 rounded-xl border border-slate-800 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-violet-400 uppercase cursor-grab">⋮⋮ {block.type}</span>
                  <div className="flex gap-1">
                    <button type="button" className="text-xs text-slate-500 hover:text-white" onClick={() => moveBlock(i, i - 1)}>↑</button>
                    <button type="button" className="text-xs text-slate-500 hover:text-white" onClick={() => moveBlock(i, i + 1)}>↓</button>
                    <button type="button" className="text-xs text-rose-400" onClick={() => setBlocks((b) => b.filter((_, j) => j !== i))}>×</button>
                  </div>
                </div>
                <BlockEditor block={block} onChange={(b) => setBlocks((arr) => arr.map((x, j) => (j === i ? b : x)))} />
                <div className="mt-3 pt-3 border-t border-slate-800"><BlockPreview block={block} /></div>
              </div>
            ))}
            {!blocks.length && <p className="text-center text-slate-500 py-12">Add blocks from the palette above</p>}
          </div>
        )}

        {tab === 'markdown' && (
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
            <textarea
              className="w-full h-96 font-mono text-sm border border-slate-700 rounded-xl p-4 bg-slate-900 text-slate-200 focus:border-violet-500 focus:outline-none"
              value={markdownBody}
              onChange={(e) => setMarkdownBody(e.target.value)}
              placeholder="# Page markdown body..."
            />
            <div className="prose prose-invert prose-sm bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-auto h-96 max-w-none">
              <ReactMarkdown>{markdownBody || '*Preview appears here*'}</ReactMarkdown>
            </div>
          </div>
        )}

        {tab === 'preview' && (
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
            {blocks.map((b) => (
              <div key={b.id}>
                {b.type === 'markdown' ? (
                  <div className="prose prose-invert max-w-none"><ReactMarkdown>{String((b.content as Record<string, string>)?.source ?? '')}</ReactMarkdown></div>
                ) : (
                  <BlockPreview block={b} />
                )}
              </div>
            ))}
            {markdownBody && (
              <div className="prose prose-invert border-t border-slate-700 pt-6 max-w-none">
                <ReactMarkdown>{markdownBody}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {media?.length > 0 && tab === 'builder' && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-500">
          Quick insert from library:
          {media.slice(0, 6).map((m) => (
            <button key={m._id} type="button" className="ml-2 text-violet-400 hover:text-violet-300 underline" onClick={() => insertMedia(m.url)}>
              {m.originalName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
