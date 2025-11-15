# LERN Platform

**Learning Employment Records Network** - A competency verification platform connecting learners, educators, and industry experts.

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server (port 4242)
npm run dev

# Deploy to Firebase
npm run deploy
```

**Live POC**: https://lern-poc.web.app

---

## Documentation

- **[MVP Outline](docs/mvp-outline.md)** - Feature scope and user stories
- **[Technical Architecture](docs/technical-architecture.md)** - Stack decisions and implementation phases
- **[Code Conventions](docs/CONVENTIONS.md)** - Naming standards and best practices

---

## Stack

- **Next.js 14** (App Router, TypeScript, Server Components)
- **Firebase** (Firestore, Auth, Storage, Hosting)
- **Tailwind CSS + shadcn/ui** (Styling)

---

## Project Structure

```
lern/
├── app/                    # Next.js pages and routes
├── components/             # React components
├── types/                  # Shared TypeScript types
├── lib/                    # Utilities, converters, Firebase config
├── docs/                   # Project documentation
└── firebase.json           # Firebase configuration
```

---

## Firebase Project

- **Project ID**: `lern-poc`
- **Console**: https://console.firebase.google.com/project/lern-poc

---

## Development

Built with ❤️ using Claude Code
