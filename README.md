# ContentWeave

Headless CMS with drag-and-drop page builder, live markdown editor, and media library — inspired by Contentful.

## Features

- Page builder with reorderable blocks (Hero, Text, Image, CTA, Markdown)
- Split-pane markdown editor with live preview
- Media library upload, preview, and insert
- JWT auth; first registered user becomes admin
- Multi-page admin: dashboard, pages, editor, media

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | TypeScript, Express, Mongoose |
| Frontend | TypeScript, React, Vite, Tailwind CSS |
| Markdown | react-markdown          |
| Auth     | JWT                     |

## Ports

| Service | Port |
|---------|------|
| UI      | 5015 |
| API     | 6015 |

## Quick Start

```bash
cp .env.example .env
npm run install:all
npm run dev
```

- **UI:** http://localhost:5015
- **API:** http://localhost:6015

## Project Structure

```
ContentWeave/
├── client/           # React admin UI
├── server/           # Express API
├── docker-compose.yml
└── package.json
```

## License

MIT
