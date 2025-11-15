# LERN Proof of Concept (POC) - MVP Outline

## Overview
This document summarizes the structure and scope of the LERN (Learning Employment Records Network) proof of concept. It consolidates the discussions and user stories into a concise feature plan for development. The goal is to demonstrate the full learning-to-employment loop in a minimal but functional MVP.

---

## Core Personas

### 1. Learner
- Views their competencies and progress.
- Completes self-assessments (0–4 scale).
- Uploads portfolio artifacts (PDF, JPG, MP4) tagged to competencies.
- Receives verification requests from educators.
- Can share a public version of their LERN profile via a unique URL.

### 2. Educator
- Creates learner profiles and defines competencies.
- Imports transcript data and maps it to existing competencies (via AI-assisted mapping in the POC).
- Creates new competency definitions (hard and soft skills).
- Performs mentor assessments (0–4 scale) on learners.
- Initiates rating requests to learners and industry experts (master evaluators).
- Views all learner competencies and artifacts.
- Manages organization-level settings and exports (if applicable).

### 3. Industry Expert (Employer Partner)
- Receives evaluation requests from educators.
- Logs in to view assigned learners and completes ratings (0–4 scale).
- Optionally uploads artifacts or comments supporting a rating.
- No broader system visibility—only what is shared via rating requests.

---

## Core Screens & Flows

### 1. **Educator Dashboard**
- List of learners with quick links to their profiles.
- Ability to create and edit competencies.
- Form to upload transcripts and invoke AI mapping to competencies.
- Button to create a new “Rating Request” (for self, mentor, master assessments).
- Simple report/export tab (placeholder for now).

### 2. **Learner Dashboard**
- Displays all competencies with latest self/mentor/master ratings.
- Interface for self-assessment on each competency.
- Ability to upload and tag artifacts.
- Shows pending verification requests and status.
- Option to generate public share link for their LERN profile.

### 3. **Industry Expert View**
- Minimal interface listing rating requests.
- Each item shows the learner name, competency, and rubric (0–4 scale).
- Submit rating and optional comment or artifact.

### 4. **Public LER Page (Read-Only)**
- Displays learner’s verified competencies and artifacts.
- Shows who verified each competency (Self, Mentor, Master).
- Provides a simple trust visualization (badges or icons).
- Available via secure public URL.

---

## Core Data Concepts

### Entities
- **User**: Has roles (learner, educator, industry_expert) and belongs to an organization.
- **Organization**: Represents a school or employer; users can have multiple roles within one.
- **Competency**: A defined skill (hard or soft), created by educators.
- **Rating Event**: Record of a competency rating (0–4), tied to a learner and rater.
- **Artifact**: Uploaded media linked to a competency.
- **Verification Request**: Links a learner, competency, and rater; tracks status (“pending”, “completed”).
- **Public Profile**: Shareable view that aggregates verified competencies.

### Optional / Future Entities
- **Attendance, Behavior, Credits (ABC)**: Placeholder data to demo “On Track / Off Track” status.
- **ExportRecord**: For SIS/state reporting; not implemented in MVP.

---

## AI Integration (POC Use Case)
- Transcript upload triggers AI-assisted mapping:
  - Input: transcript text + existing competencies.
  - Output: suggested competency matches and baseline scores.
- Educator reviews and confirms before saving.

---

## MVP Scope Summary

| Feature | Included | Notes |
|----------|-----------|-------|
| Learner profiles | ✅ | Created by educators. |
| Competency creation | ✅ | Defined by educators only. |
| Self/Mentor/Master ratings | ✅ | Full triple rating flow. |
| Artifact uploads | ✅ | By any participant. |
| Public shareable learner profile | ✅ | Read-only, trusted signal. |
| Industry expert evaluation flow | ✅ | Via rating requests. |
| Transcript import (AI-mapped) | ✅ | Simulated via mock or AI call. |
| Attendance/Behavior/Credits | ⚙️ | Demo-only placeholders. |
| Admin exports | ⚙️ | Placeholder for later phase. |
| Job posting / matching | ❌ | Out of scope for MVP. |

---

## Notes & Assumptions
- Educators act as organization admins in the MVP.
- Organizations are created implicitly when the first user signs up.
- Authentication: basic username/password login.
- Roles determine which dashboard view a user sees.
- MVP will prioritize the “triple rating” flow as the core demonstration.
- Export/reporting functionality deferred until client provides field requirements.

---

## Next Steps
1. Build schema and basic authentication.
2. Implement educator dashboard (core admin functions).
3. Implement competency + rating workflows.
4. Add learner dashboard and artifact uploads.
5. Implement industry expert rating interface.
6. Create public learner profile page.
7. Optional AI integration for transcript → competency mapping.
8. Demo-ready version with seeded data for stakeholders.
