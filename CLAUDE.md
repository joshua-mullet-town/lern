# LERN Project - Claude Instructions

## 📋 First: Check These Docs

Before doing anything, review:

1. **`/docs/CONVENTIONS.md`** - Code standards (naming, file structure, patterns)
2. **`/docs/BUILD_CHECKLIST.md`** - What we're building and in what order
3. **`/docs/mvp-outline.md`** - Feature scope and user stories
4. **`/docs/technical-architecture.md`** - Stack decisions and why

## 🎯 Current Status

**Completed**:
- ✅ Project setup (Next.js, Firebase, TypeScript, Tailwind, shadcn)
- ✅ Types system with shared types
- ✅ Firestore security rules (open for POC)
- ✅ Seed script with demo data
- ✅ Educator layout (sidebar + mobile nav)
- ✅ Competencies page (list + create modal)

**Next**: See `/docs/BUILD_CHECKLIST.md` for full roadmap

## 🚀 Quick Commands

```bash
npm run dev         # Dev server (http://localhost:4242)
npm run seed        # Populate Firestore with demo data
npm run deploy      # Build + deploy to Firebase
```

## 🔑 Hardcoded IDs (No Auth Yet)

```typescript
EDUCATOR_ID = 'demo-educator-123'
ORG_ID = 'demo-org-456'
LEARNER_1_ID = 'demo-learner-001'
LEARNER_2_ID = 'demo-learner-002'
```

## 📦 Stack

- Next.js 14 (App Router, TypeScript, Server Components)
- Firebase (Firestore, Auth, Storage, Hosting)
- Tailwind CSS + shadcn/ui
- Route groups: `(educator)`, `(learner)`, `(public)`

## 🧭 Project Organization

```
lern/
├── docs/                      # All documentation here
│   ├── CONVENTIONS.md         # Code standards - READ FIRST
│   ├── BUILD_CHECKLIST.md     # Build roadmap - FOLLOW THIS
│   ├── mvp-outline.md         # Feature scope
│   └── technical-architecture.md
├── app/(educator)/            # Educator routes + layout
├── app/(learner)/             # Learner routes + layout
├── components/                # Organized by feature
│   ├── competency/
│   ├── learner/
│   └── layout/
├── types/                     # Shared TypeScript types
└── lib/                       # Firebase, converters, utils
```

## 💡 Remember

- **Always check CONVENTIONS.md before creating files**
- **Follow BUILD_CHECKLIST.md for build order**
- Mobile-first responsive design
- Keep it simple for POC

## 🚨 CRITICAL RULES - DO NOT BREAK THESE

### 1. NEVER Use `any` Type

**This is non-negotiable.** Using `any` defeats the purpose of TypeScript and introduces bugs.

❌ **NEVER do this:**
```typescript
const data: any = { ... };
const result = something as any;
function process(data: any) { ... }
```

✅ **Instead, use proper types:**
```typescript
// Use Record for dynamic objects
const data: Record<string, unknown> = { ... };

// Use specific types or interfaces
interface MyData { field: string; }
const data: MyData = { ... };

// Use union types for multiple possibilities
const result: string | number = something;

// Use 'unknown' if truly unknown, then narrow with type guards
const data: unknown = something;
if (typeof data === 'string') { ... }
```

**Why this matters:** If you reach for `any`, it means you need to understand the data structure better. Take the time to properly type it.

### 2. Reuse Types Aggressively - Don't Duplicate

**Keep the type system tight.** Before creating a new type or interface, check if you can reuse or derive from existing types.

❌ **DON'T create duplicate types:**
```typescript
// Bad - duplicating User structure
interface EducatorProfile {
  id: string;
  email: string;
  display_name: string;
  org_id: string;
}
```

✅ **DO reuse existing types with TypeScript utilities:**
```typescript
// Good - reuse User type
import { User } from '@/types';

// Pick specific fields
type UserProfile = Pick<User, 'id' | 'display_name' | 'email'>;

// Make fields optional
type PartialUser = Partial<User>;

// Omit fields you don't need
type UserWithoutAuth = Omit<User, 'password_hash'>;

// Extend existing types when you need additional fields
interface EducatorWithStats extends User {
  total_learners: number;
  active_competencies: number;
}
```

**Process before creating a new type:**
1. Check `/types/` directory - does this type already exist?
2. Can I use `Pick`, `Omit`, `Partial`, or `Required` on an existing type?
3. Can I extend an existing type with additional fields?
4. Only create a new type if it's truly a new entity

**Why this matters:** Type reuse provides clarity for both humans and AI. When types proliferate unnecessarily, it becomes unclear what the "source of truth" is and creates maintenance burden.
