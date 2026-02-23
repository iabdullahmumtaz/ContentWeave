import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import User from './models/User.js';
import Page from './models/Page.js';
import Media from './models/Media.js';
import { authRequired } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const app = express();
const PORT = process.env.PORT || 6015;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

await fs.mkdir(UPLOAD_DIR, { recursive: true });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/contentweave');

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const count = await User.countDocuments();
  const role = count === 0 ? 'admin' : 'editor';
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email taken' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name: name || 'Editor', passwordHash, role });
  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const user = await User.findById(req.userId).select('email name role');
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
});

app.get('/api/pages', authRequired, async (_, res) => {
  const pages = await Page.find().sort({ updatedAt: -1 }).select('title slug status updatedAt blocks');
  res.json(pages);
});

app.get('/api/pages/by-id/:id', authRequired, async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json(page);
});

app.get('/api/pages/:slug', async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) return res.status(404).json({ error: 'Not found' });
  if (page.status !== 'published' && !req.headers.authorization?.startsWith('Bearer ')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(page);
});

app.post('/api/pages', authRequired, async (req, res) => {
  const { title, slug, blocks, markdownBody, status } = req.body;
  const page = await Page.create({
    title,
    slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
    blocks: blocks || [],
    markdownBody,
    status: status || 'draft',
    authorId: req.userId,
  });
  res.status(201).json(page);
});

app.put('/api/pages/:id', authRequired, async (req, res) => {
  const page = await Page.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      slug: req.body.slug,
      blocks: req.body.blocks,
      markdownBody: req.body.markdownBody,
      status: req.body.status,
    },
    { new: true }
  );
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json(page);
});

app.delete('/api/pages/:id', authRequired, async (req, res) => {
  await Page.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.get('/api/media', authRequired, async (_, res) => {
  res.json(await Media.find().sort({ createdAt: -1 }));
});

app.post('/api/media/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const filename = `${uuidv4()}${path.extname(req.file.originalname)}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), req.file.buffer);
  const url = `/uploads/${filename}`;
  const media = await Media.create({
    filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url,
    uploadedBy: req.userId,
  });
  res.status(201).json(media);
});

app.delete('/api/media/:id', authRequired, async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) return res.status(404).json({ error: 'Not found' });
  try {
    await fs.unlink(path.join(UPLOAD_DIR, media.filename));
  } catch { /* ignore */ }
  await Media.deleteOne({ _id: media._id });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`ContentWeave API on http://localhost:${PORT}`));
