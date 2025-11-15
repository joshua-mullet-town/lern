# LERN POC - Technical Architecture & Implementation Plan

## Stack Recommendations (2025)

### Frontend Framework
**Next.js 14+ (App Router)**
- **Why**: Server components for auth/data fetching, client components for interactivity
- **Firebase Integration**: Official support via Firebase App Hosting (GA in 2025)
- **Local Dev**: `npm run dev` with Firebase emulators for auth/Firestore
- **Deployment**: Firebase App Hosting (not traditional Hosting + Functions)

### Styling Solution
**Tailwind CSS + shadcn/ui**
- **Why shadcn over daisyUI**:
  - Copy/paste components = full customization control
  - Built on Radix UI = accessibility by default
  - No runtime JS shipped to browser
  - TypeScript-first
- **Strategy**: "Good enough" design system without pixel-pushing
  - Use shadcn CLI: `npx shadcn-ui@latest add button`
  - Customize theme once in `tailwind.config.ts`
  - Components live in your codebase (`/components/ui/`)

**Claude Code Workflow**:
```bash
# Install shadcn component on-demand
npx shadcn-ui@latest add [component-name]

# Claude can then modify the component directly for custom needs
```

### Database & Auth
**Firebase (v9+ modular SDK)**
- **Firestore**: Document-based, real-time subscriptions
- **Authentication**: Built-in email/password (expandable to OAuth later)
- **Storage**: For artifacts (PDF/JPG/MP4)
- **Security Rules**: Declarative row-level security

**Server vs Client SDK Strategy**:
- **Server Components** (data fetching): Firebase Admin SDK
- **Client Components** (auth state, real-time listeners): Firebase Client SDK
- **Route Handlers** (API routes): Firebase Admin SDK

### TypeScript Integration
**Full TypeScript Support (Native)**
- **Next.js 14**: TypeScript enabled by default in project scaffolding
  - Auto-generates `tsconfig.json` with optimal settings
  - Type-checks at build time (deployment fails if errors exist)
  - Supports experimental typed routes (prevents typos in `next/link`)
- **Firebase SDK v9+**: Ships with built-in TypeScript definitions
  - Type-safe Firestore queries using `withConverter()`:
    ```typescript
    const converter = {
      toFirestore: (data: Competency) => data,
      fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Competency
    };

    const competenciesRef = collection(db, 'competencies').withConverter(converter);
    // Now fully typed - autocomplete and type checking work!
    ```
  - No `@types/*` packages needed - definitions included
- **Why TypeScript for this project**:
  - Firestore schema complexity benefits from type safety
  - Prevents runtime errors from role/permission logic
  - Better DX with autocomplete for competency/rating fields
  - Refactoring confidence (rename fields without fear)

### Hosting & Functions
**Firebase App Hosting** (not traditional Cloud Functions)
- **Rationale**:
  - Unified CLI experience (`firebase deploy`)
  - Automatic SSR function generation
  - Integrated emulator suite for local dev
  - No manual function wiring needed
- **Future-Proofing**: Can add standalone Cloud Functions later if needed

---

## Architecture Patterns

### Authentication Flow
```typescript
// Server Component (app/dashboard/page.tsx)
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const session = await adminAuth.verifySessionCookie(cookies().get('session'));
// Render with user data

// Client Component (components/LoginForm.tsx)
'use client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

// Handle login, set session cookie via API route
```

### Data Fetching
```typescript
// Server Component (fetch competencies for learner)
import { adminDb } from '@/lib/firebase-admin';

const competencies = await adminDb
  .collection('competencies')
  .where('learnerId', '==', userId)
  .get();

// Client Component (real-time rating updates)
'use client';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'ratings'),
    (snapshot) => setRatings(snapshot.docs)
  );
  return unsubscribe;
}, []);
```

### File Uploads
```typescript
// Client Component (artifact upload)
'use client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase-client';

const storageRef = ref(storage, `artifacts/${userId}/${file.name}`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);

// Save metadata to Firestore with URL
```

---

## Firestore Schema Design

### Collections Structure
```
organizations/
  {orgId}/
    name: string
    created_at: timestamp

users/
  {userId}/
    email: string
    org_id: string
    roles: ['learner' | 'educator' | 'industry_expert']
    display_name: string
    created_at: timestamp

competencies/
  {competencyId}/
    org_id: string
    created_by: string (userId)
    title: string
    description: string
    type: 'hard' | 'soft'
    rubric: {
      0: "No evidence",
      1: "Beginning",
      2: "Developing",
      3: "Proficient",
      4: "Expert"
    }
    created_at: timestamp

ratings/
  {ratingId}/
    learner_id: string (userId)
    competency_id: string
    rater_id: string (userId)
    rater_type: 'self' | 'mentor' | 'master'
    score: 0 | 1 | 2 | 3 | 4
    comment?: string
    artifact_url?: string
    created_at: timestamp

artifacts/
  {artifactId}/
    uploaded_by: string (userId)
    learner_id: string (userId)
    file_url: string
    file_type: 'pdf' | 'jpg' | 'png' | 'mp4'
    file_size: number
    competency_ids: string[] (can link to multiple)
    created_at: timestamp

verification_requests/
  {requestId}/
    learner_id: string
    competency_id: string
    requester_id: string (educator userId)
    rater_id: string (industry expert userId)
    rater_email: string
    status: 'pending' | 'completed' | 'expired'
    created_at: timestamp
    completed_at?: timestamp
```

### Security Rules Philosophy
- **Educators**: Read/write all data within their org
- **Learners**: Read own data, write self-ratings and artifacts
- **Industry Experts**: Read only assigned verification requests, write ratings

---

## Styling Guidelines for Claude Code

### Component Pattern
When building UI, Claude should:
1. **Start with shadcn component**: `npx shadcn-ui@latest add [component]`
2. **Compose with Tailwind utilities**: `className="flex items-center gap-4"`
3. **Use semantic color tokens**: `bg-primary`, `text-muted-foreground` (not raw colors)
4. **Mobile-first responsive**: `md:flex-row` (default to mobile stack)

### Design Constraints
- **No custom CSS files**: Everything in Tailwind classes
- **Consistent spacing scale**: Use `gap-4`, `p-6`, `mb-8` (multiples of 4)
- **Limited color palette**: Primary, secondary, muted, destructive (from shadcn theme)
- **Typography**: Use `text-sm`, `text-base`, `text-lg` (no custom font sizes)

### Example Component
```typescript
// Good: Readable, consistent, "good enough"
<Card className="p-6">
  <CardHeader>
    <CardTitle className="text-2xl">Competencies</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {competencies.map(c => (
      <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
        <span className="font-medium">{c.title}</span>
        <Badge variant="secondary">{c.type}</Badge>
      </div>
    ))}
  </CardContent>
</Card>

// Bad: Over-styled, one-off classes
<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-[13px] rounded-[9px]">
  {/* ... */}
</div>
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
**Goals**: Auth working, basic CRUD, shadcn installed

**Tasks**:
1. Initialize Next.js 14 project with TypeScript
2. Install Firebase SDKs (client + admin)
3. Install shadcn/ui and configure theme
4. Set up Firebase project (Firestore, Auth, Storage)
5. Implement session-based auth (login/logout)
6. Create basic layout with navigation
7. Build educator dashboard shell (empty state)

**Deliverable**: Can log in as educator, see empty dashboard

---

### Phase 2: Competency Management (Week 2-3)
**Goals**: Educators can create/view competencies

**Tasks**:
1. Create competency creation form (shadcn Form + Input components)
2. Implement Firestore writes for new competencies
3. Build competency list view with real-time updates
4. Add hard/soft skill toggle
5. Create rubric definition UI (0-4 scale)
6. Add edit/delete functionality

**Deliverable**: Educator can manage competency library

---

### Phase 3: Learner Profiles & Self-Assessment (Week 3-4)
**Goals**: Learners can view competencies and self-assess

**Tasks**:
1. Create learner user creation flow (educator creates account)
2. Build learner dashboard with competency grid
3. Implement self-assessment modal (rating 0-4 + optional comment)
4. Show rating history (self vs mentor vs master in table)
5. Add basic profile page

**Deliverable**: Learner can self-assess on competencies

---

### Phase 4: Artifact Uploads (Week 4-5)
**Goals**: Any user can upload and tag artifacts

**Tasks**:
1. Implement file upload component (drag-drop or button)
2. Add Firebase Storage integration
3. Create artifact-competency linking interface (checkboxes)
4. Build artifact gallery view (thumbnails for images, icons for PDF/video)
5. Add file size/type validation (max 50MB, PDF/JPG/PNG/MP4 only)

**Deliverable**: Learners can upload portfolio artifacts

---

### Phase 5: Rating Requests & Industry Expert Flow (Week 5-6)
**Goals**: Full triple-rating system working

**Tasks**:
1. Create verification request form (educator selects learner + competency + expert email)
2. Send email notification to industry expert (Firebase Extensions or SendGrid)
3. Build industry expert login flow (magic link or temp password)
4. Create expert dashboard (list of pending requests)
5. Implement master rating submission form
6. Add mentor rating flow (educator rates learner)
7. Show all three ratings side-by-side on learner dashboard

**Deliverable**: Full self/mentor/master rating loop

---

### Phase 6: Public Profile (Week 6-7)
**Goals**: Shareable learner portfolio

**Tasks**:
1. Generate unique shareable URL per learner (`/profile/{userId}?token={securityToken}`)
2. Create read-only public profile page
3. Display verified competencies with trust badges (self/mentor/master icons)
4. Show artifacts linked to each competency
5. Add "Last updated" timestamp
6. Optional: PDF export of profile

**Deliverable**: Learner can share trusted portfolio URL

---

### Phase 7: AI Transcript Mapping (Week 7-8)
**Goals**: Demo AI-assisted competency mapping

**Tasks**:
1. Create transcript upload form (paste text or upload PDF)
2. Integrate Claude API for transcript analysis
3. Build AI suggestion review interface (educator approves/rejects matches)
4. Auto-populate baseline ratings from transcript data
5. Show confidence scores for AI matches

**Example Prompt**:
```
Given this transcript:
"""
{transcript_text}
"""

And these existing competencies:
{competencies_json}

Return JSON with suggested matches:
{
  "matches": [
    {
      "competency_id": "abc123",
      "confidence": 0.85,
      "evidence": "Course grade of A in Python Programming",
      "suggested_rating": 3
    }
  ]
}
```

**Deliverable**: Educator can bulk-import learner data from transcripts

---

### Phase 8: Polish & Demo Prep (Week 8)
**Goals**: Production-ready demo

**Tasks**:
1. Seed realistic demo data (3 learners, 10 competencies, 20 ratings)
2. Add loading states and error handling
3. Mobile responsive testing
4. Deploy to Firebase App Hosting
5. Write deployment documentation
6. Create demo script for stakeholders

**Deliverable**: Live demo URL with walkthrough

---

## Local Development Workflow

### Initial Setup
```bash
# Create project
npx create-next-app@latest lern-poc --typescript --tailwind --app

cd lern-poc

# Install Firebase
npm install firebase firebase-admin

# Install shadcn
npx shadcn-ui@latest init

# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting
firebase init emulators  # Select Auth, Firestore, Storage
```

### Daily Development
```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Firebase emulators
firebase emulators:start

# Access:
# - App: http://localhost:3000
# - Firestore UI: http://localhost:4000
# - Auth UI: http://localhost:4000
```

### Deployment
```bash
# Build and deploy
npm run build
firebase deploy
```

---

## Key Decision Rationale

### Why Next.js App Router over Pages Router?
- Server components = less client JS = faster page loads
- Nested layouts = DRY navigation/auth wrappers
- Route handlers = API routes without `/api` convention

### Why shadcn over daisyUI?
- **Customization**: Components in your codebase (not black-box npm package)
- **Type Safety**: Full TypeScript support
- **Accessibility**: Built on Radix UI primitives
- **Claude-Friendly**: Can modify components directly without fighting abstraction

### Why Firebase over Supabase?
- **User familiarity**: You mentioned Firebase already
- **Zero backend code**: Firestore rules = backend logic
- **Integrated ecosystem**: Auth + DB + Storage + Hosting in one CLI

### Why Not Cloud Functions Initially?
- **App Hosting handles SSR**: Automatic function generation for server components
- **Simpler mental model**: No function/trigger management
- **Add later**: Can introduce standalone functions for cron jobs, webhooks, etc.

---

## Open Questions & Decisions Needed

### Before Phase 1
- [ ] **Firebase project name**: What should we call it? (`lern-poc`, `lern-mvp`?)
- [ ] **Color scheme**: Any brand colors to use in shadcn theme? (default is fine)
- [ ] **Email provider**: For industry expert invites (Firebase Extensions free tier? SendGrid?)

### Before Phase 4
- [ ] **File size limits**: 50MB per file? Total per learner?
- [ ] **Storage costs**: Firebase Storage pricing is $0.026/GB/month - acceptable?

### Before Phase 6
- [ ] **Public URL security**: Obfuscated token? Expiring links? Revocable?
- [ ] **SEO considerations**: Should profiles be indexable? (Probably not for POC)

### Before Phase 7
- [ ] **AI provider**: Claude API (your call)? OpenAI? (Claude recommended for structured output)
- [ ] **AI costs**: Estimate 1000 tokens/transcript = $0.03/upload - acceptable?

---

## Success Metrics for POC

### Technical Metrics
- [ ] Page load time < 2s
- [ ] Mobile responsive (320px to 2560px)
- [ ] Zero console errors in production
- [ ] Security rules tested and working

### Feature Completeness
- [ ] All 3 personas can log in and complete core workflows
- [ ] AI transcript mapping works with 80%+ accuracy on sample data
- [ ] Public profile shareable and loads in <1s

### Demo Readiness
- [ ] 5-minute walkthrough script prepared
- [ ] Demo data realistic and compelling
- [ ] Known bugs documented with workarounds

---

## Next Steps

1. **Review this doc**: Confirm stack choices align with your vision
2. **Answer open questions**: Firebase project name, email provider, etc.
3. **Create project structure**: Initialize Next.js + Firebase
4. **Start Phase 1**: Get auth working first

Ready to start building?
