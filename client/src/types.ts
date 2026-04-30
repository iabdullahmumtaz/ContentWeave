export interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  role?: 'admin' | 'editor';
}

export interface PageBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta' | 'markdown';
  content: Record<string, unknown>;
  order?: number;
}

export interface Page {
  _id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  blocks: PageBlock[];
  markdownBody?: string;
}

export interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}
