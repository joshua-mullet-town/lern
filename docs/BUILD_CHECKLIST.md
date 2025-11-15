# LERN POC - Build Checklist

**Goal**: Demonstrate the full learner → educator → industry expert competency verification loop.

---

## ✅ Phase 0: Foundation (COMPLETED)

- [x] Next.js 14 + TypeScript setup
- [x] Firebase project created (`lern-poc`)
- [x] Tailwind + shadcn/ui installed
- [x] Types system (`/types/` with core entities)
- [x] Firebase client + admin SDK config
- [x] Firestore converters for type safety
- [x] Seed script (`npm run seed`)
- [x] Security rules (open for POC)
- [x] Deploy script (`npm run deploy`)

---

## ✅ Phase 1: Educator Competency Management (COMPLETED)

- [x] `(educator)` route group + layout with sidebar
- [x] Sidebar navigation (desktop + mobile bottom nav)
- [x] `/competencies` - List all competencies
- [x] `CompetencyCard` component
- [x] `CreateCompetencyModal` - Form to create competency
- [x] Firestore write for new competencies

**Result**: Educator can view and create competency definitions ✅

---

## ✅ Phase 2: Educator Learner Management (COMPLETED)

### What We're Building
Educators need to create learner accounts and view their profiles. This includes an optional AI-powered transcript import flow to automatically suggest initial competency ratings.

### Pages to Build
- [x] `/learners` - List all learners in org
- [x] `/learners/create` - Multi-step learner creation wizard:
  - **Step 1**: Name + email
  - **Step 2**: Optional document upload (transcripts, letters of rec)
  - **Step 3**: Review/edit competency ratings (AI-suggested or manual)
- [x] `/learners/[learnerId]` - Learner profile view

### Components to Build
- [x] `components/learner/LearnerCard.tsx` - Preview card for list view
- [x] `components/learner/CreateLearnerWizard.tsx` - Multi-step form
- [x] `components/learner/TranscriptUpload.tsx` - File upload UI (integrated in wizard)
- [x] `components/learner/CompetencyRatingReview.tsx` - Edit ratings before saving (integrated in wizard)
- [x] `components/learner/LearnerProfileHeader.tsx` - Name + email + avatar placeholder
- [x] `components/rating/AddCompetencyRating.tsx` - Manually add competency + initial mentor rating to learner

### API/Logic to Build
- [x] `lib/ai/suggestRatings.ts` - Call OpenAI with transcript + competencies, return suggested ratings
- [x] API route to handle transcript upload + AI call (`/api/analyze-transcript`)
- [x] Create user with `roles: ['learner']`
- [x] Create initial mentor ratings for learner

### Learner Profile Page (`/learners/[learnerId]`)
- [x] Basic info at top (name, email)
- [x] List of competencies learner has been rated on
- [x] Show average rating per competency (click to see all individual ratings)
- [x] Button to manually add new competency + mentor rating

### Data Needed
- [x] Query learners from Firestore (filter by `org_id`)
- [x] Query ratings for specific learner
- [x] Group ratings by competency, calculate average
- [x] Create new user + initial ratings in single transaction

**Result**: Educator can create learners with AI-assisted rating import and view their profiles ✅

---

## ✅ Phase 3: Learner Self-Assessment Flow (COMPLETED)

### What We're Building
Learners need to respond to rating requests from their mentor. They rate themselves on competencies (0-4 scale), add comments, and upload artifacts as evidence.

### Pages to Build
- [x] `(learner)` route group + layout (same sidebar pattern, different nav items)
- [x] `/learner` - Learner dashboard (their competencies + pending requests)
- [x] Self-assessment flow (modal-based)

### Components to Build
- [x] `components/learner/StartAssessmentButton.tsx` - Notification card/button to start flow
- [x] `components/learner/SelfRatingForm.tsx` - Modal wizard stepping through pending ratings one-by-one
- [x] Rating scale (0-4) + comment + artifact upload integrated in form
- [x] Multi-file artifact upload with Firebase Storage integration

### Learner Dashboard (`/learner`)
- [x] Show all competencies learner has been rated on
- [x] For each competency: show average rating + individual ratings (self, mentor, master)
- [x] Blue notification card if pending rating requests exist
- [x] Click "Start Self-Assessment" → enter modal flow

### Self-Assessment Flow
- [x] Fetch all pending ratings where `status: 'pending'` and `rater_id: current_learner_id`
- [x] Show one at a time: competency title + description + rubric
- [x] Learner selects rating 0-4, adds optional comment
- [x] Learner uploads multiple artifacts (stored in Firebase Storage, URLs in rating)
- [x] On submit: update rating to `status: 'completed'`, add score/comment/artifacts
- [x] Move to next pending rating with progress indicator

### Data Needed
- [x] Query ratings where `learner_id: userId` to show all competencies
- [x] Query pending ratings where `learner_id: userId` and `status: 'pending'` and `rater_type: 'self'`
- [x] Upload artifacts to Firebase Storage (`artifacts/{learnerId}/{ratingId}/{filename}`)
- [x] Update rating with score, comment, artifact URLs

**Result**: Learner can self-assess on competencies and upload evidence ✅

---

## ✅ Phase 4: Educator Creates Rating Requests (COMPLETED)

### What We're Building
Educators need a way to create new rating events for learners. When creating a rating request, they can optionally send it to the learner (self-assessment) and/or an employer (master rating).

### Pages to Build
- [x] Extended `/learners/[learnerId]` to include "Add Competency Rating" button
- [x] Modal for creating rating request

### Components to Build
- [x] `components/rating/AddCompetencyRating.tsx`
  - Select competency (dropdown of org's competencies)
  - Select rater type: self, mentor, or master (radio buttons)
  - If master: dropdown to select employer (list of users with `role: 'master'`)
  - Initial rating for mentor type (0-4 scale)
  - Submit button

### Logic to Build
- [x] When "self" selected: create rating with `rater_type: 'self'`, `status: 'pending'`, `rater_id: learner_id`
- [x] When "master" selected: create rating with `rater_type: 'master'`, `status: 'pending'`, `rater_id: selected_employer_id`
- [x] When "mentor" selected: create rating with `rater_type: 'mentor'`, `status: 'completed'`, with educator's score

### Data Needed
- [x] Query employers (users with `role: 'master'` in org)
- [x] Query all competencies in org
- [x] Create rating document based on selected type

**Result**: Educator can assign competencies and request ratings from learner/employer ✅

---

## ✅ Phase 5: Employer (Master) Interface (COMPLETED)

### What We're Building
Employers receive rating requests and can rate learners on specific competencies. They only see the competency and learner name - no other context.

### Pages to Build
- [x] `(master)` route group + layout (sidebar with navigation)
- [x] `/master` - List of pending rating requests
- [x] `/master/rate/[ratingId]` - Rating submission form

### Components to Build
- [x] `components/rating/RatingRequestCard.tsx` - Shows learner name + competency to rate
- [x] `components/rating/MasterRatingForm.tsx` - Rating scale (0-4) + optional comment + submit

### Employer Dashboard (`/master`)
- [x] List all ratings where `rater_id: current_user_id` and `status: 'pending'`
- [x] Show learner name + competency title
- [x] Click to go to rating form
- [x] Empty state if no pending requests

### Rating Form (`/master/rate/[ratingId]`)
- [x] Show competency title + description
- [x] Show learner name (no other info)
- [x] Rating scale 0-4 with dropdown
- [x] Optional comment textarea
- [x] Submit button updates rating to `status: 'completed'` with score/comment
- [x] Redirects back to dashboard after submission

### Data Needed
- [x] Query pending ratings for current employer
- [x] Fetch specific rating + competency + learner name
- [x] Update rating with score/comment, set status to 'completed'

**Result**: Industry experts can fulfill rating requests ✅

---

## ✅ Phase 6: Public Profile (COMPLETED)

### What We're Building
Learners get a shareable public URL showing their verified competencies. Employers can view these anonymously when searching candidates.

### Pages to Build
- [x] `(public)` route group (no auth, no layout - just basic header)
- [x] `/profile/[learnerId]` - Read-only public portfolio

### Components to Build
- [x] `components/public/PublicProfileHeader.tsx` - Learner name + org name
- [x] `components/public/CompetencyWithTrustBadges.tsx` - Competency + ratings + who verified (with timeline display)
- [x] `components/public/TrustBadge.tsx` - Icons showing who verified (self/mentor/master)
- [ ] `components/artifact/ArtifactGallery.tsx` - View artifacts attached to ratings (deferred)

### Public Profile Page
- [x] Show learner name + org name
- [x] Show competencies where:
  - Learner has ≥1 completed rating
  - Competency ID not in `user.hidden_competency_ids`
- [x] For each competency: show average rating + individual ratings with timeline
- [x] Show trust badges (self/mentor/master icons based on who rated)
- [ ] Show artifacts attached to ratings (deferred)
- [x] No edit controls (read-only)

### Data Needed
- [x] Query user by ID (no auth required)
- [x] Query all completed ratings for user
- [x] Filter out competencies in `user.hidden_competency_ids`
- [x] Group ratings by competency, calculate average

**Result**: Shareable public portfolio URL for employers ✅

---

## ✅ Phase 7: Learner Portfolio Management (COMPLETED)

### What We're Building
Learners need to control what shows on their public profile. They should be able to hide specific competencies.

### Pages to Build
- [x] `/learner/portfolio` - Manage public profile visibility

### Components to Build
- [x] `components/learner/PortfolioManager.tsx` - Full portfolio management with toggles
- [x] API route `/api/learner/visibility` - Save visibility settings to Firestore

### Portfolio Management Page
- [x] List all competencies learner has been rated on
- [x] Each competency has visibility toggle (show/hide on public profile)
- [x] "Preview Public Profile" button → opens `/profile/[learnerId]` in new tab
- [x] Shareable link with copy button
- [x] Visible competency counter
- [x] Changes update `user.hidden_competency_ids` array in real-time

### Data Needed
- [x] Query current user's `hidden_competency_ids`
- [x] Update user document when toggling visibility

**Result**: Learners control what employers see ✅

---

## ✅ Phase 8: Job Matching (COMPLETED)

### What We Built
Simplified job matching - employers can search for candidates based on competency requirements and view their public profiles.

### Completed Features
- [x] `/master/search` - Talent search page
- [x] Competency search with slider-based min ratings (0-4 in 0.1 increments)
- [x] Token-based filter display with remove buttons
- [x] Search results showing matching learners with competency averages
- [x] Links to public profiles (open in new tab)
- [x] Respects learner privacy settings (hidden competencies)

**Note**: Skipped job notification system (sending messages to learners) as it wasn't needed for POC. Search and profile viewing provides sufficient job matching functionality.

**Result**: Employers can find and view qualified candidates ✅

---

## 📋 Phase 9: Polish & Demo Prep

- [x] Add loading states to all pages (skipped - fast client-side loading)
- [ ] Add error handling (try/catch with user-friendly messages)
- [x] Mobile responsive testing on all pages
- [x] Empty states for all lists
- [ ] Deploy to Firebase Hosting
- [ ] Update seed script with realistic demo data
- [ ] Create demo walkthrough script for presentation
- [ ] Test full flow: educator creates learner → learner self-assesses → educator requests employer rating → employer rates → public profile shows verified competencies

**Result**: Production-ready POC

---

## 🎯 Out of Scope (Post-POC)

- Authentication (Firebase Auth email/password) - using hardcoded IDs for POC
- Email notifications (using in-app only)
- Admin exports/reports
- Custom rubrics per competency (using global DEFAULT_RUBRIC)
- Attendance/Behavior/Credits tracking
- Full job posting system (just simplified anonymous search)
- Bulk learner import (CSV)
- Artifact management as standalone feature (nested in ratings only)

---

## 📊 Progress Tracker

**Completed**: 9 / 9 phases (100%)
- ✅ Phase 0: Foundation
- ✅ Phase 1: Educator Competency Management
- ✅ Phase 2: Educator Learner Management (with AI transcript analysis)
- ✅ Phase 3: Learner Self-Assessment Flow
- ✅ Phase 4: Educator Creates Rating Requests
- ✅ Phase 5: Employer (Master) Interface
- ✅ Phase 6: Public Profile (with timeline-based rating display + charts)
- ✅ Phase 7: Learner Portfolio Management
- ✅ Phase 8: Job Matching
- 🚧 Phase 9: Polish & Demo Prep (in progress)

**Remaining Tasks**:
- Error handling improvements
- Deploy to Firebase Hosting
- Create demo data and walkthrough
- End-to-end testing
