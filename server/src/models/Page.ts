import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    id: String,
    type: { type: String, enum: ['hero', 'text', 'image', 'cta', 'markdown'], required: true },
    content: mongoose.Schema.Types.Mixed,
    order: Number,
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    blocks: [blockSchema],
    markdownBody: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Page', pageSchema);
