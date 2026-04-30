import ReactMarkdown from 'react-markdown';
import type { PageBlock } from './types';

export const BLOCK_TYPES = [
  { type: 'hero' as const, label: 'Hero', default: { headline: 'Welcome', subline: 'Your story starts here', align: 'center' } },
  { type: 'text' as const, label: 'Text', default: { body: 'Add your paragraph text here.' } },
  { type: 'image' as const, label: 'Image', default: { src: '', alt: 'Image', caption: '' } },
  { type: 'cta' as const, label: 'Call to Action', default: { text: 'Get Started', href: '#', style: 'primary' } },
  { type: 'markdown' as const, label: 'Markdown', default: { source: '## Heading\n\nWrite **markdown** here.' } },
];

export function createBlock(type: PageBlock['type']): PageBlock {
  const def = BLOCK_TYPES.find((b) => b.type === type)!;
  return {
    id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    content: { ...def.default },
    order: 0,
  };
}

interface BlockPreviewProps {
  block: PageBlock;
}

export function BlockPreview({ block }: BlockPreviewProps) {
  const c = (block.content || {}) as Record<string, string>;
  switch (block.type) {
    case 'hero':
      return (
        <div className={`py-12 px-6 rounded-lg bg-gradient-to-r from-violet-900/40 to-fuchsia-900/30 ${c.align === 'left' ? 'text-left' : 'text-center'}`}>
          <h2 className="text-3xl font-bold text-white">{c.headline}</h2>
          <p className="mt-2 text-slate-300">{c.subline}</p>
        </div>
      );
    case 'text':
      return <p className="text-slate-300 leading-relaxed">{c.body}</p>;
    case 'image':
      return c.src ? (
        <figure>
          <img src={c.src} alt={c.alt} className="rounded-lg max-w-full border border-slate-700" />
          {c.caption && <figcaption className="text-sm text-slate-500 mt-1">{c.caption}</figcaption>}
        </figure>
      ) : (
        <div className="h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">No image URL</div>
      );
    case 'cta':
      return (
        <a href={c.href} className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium">
          {c.text}
        </a>
      );
    case 'markdown':
      return (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{c.source}</ReactMarkdown>
        </div>
      );
    default:
      return null;
  }
}
