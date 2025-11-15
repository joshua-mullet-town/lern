*LERN (Redwood Experience) - Phase 1 User Stories*

This document outlines the core user stories for the LERN (Learning
Employment Records Network) platform's initial proof of concept (POC). The
goal is to capture the end-to-end experience, from building a verified
record to an employer making a hiring decision.
------------------------------

*Building the Record*

*User Story* As an *educator (School Services Team)*, I want to *create a
foundational LER (LERN profile) for a new student upon enrollment* so that
I can *begin tracking their competencies and progress toward graduation
from Day 1.*

   -

   *Scenario / Example*: A new student enrolls. The central *School
   Services Team* inputs their historical transcript data. This
   auto-generates their initial Grad Plan and LERN profile.
   -

   *Data / Inputs Involved*: Student transcript (lead data), Student Grad
   Plan (lead data), student demographic info (from SIS).
   -

   *Outputs / Decisions*: A new LERN profile is created and linked to the
   student and their assigned *Teacher (Mentor)*.
   -

   *Why It Matters*: This establishes the "single source of truth" from the
   start, solving a long-standing operational bottleneck by removing the
   data-entry burden from *Principals* and *Teachers*.
   -

   *Open Questions*: What is the minimum viable data needed to create the
   profile? How does this sync with a school's SIS like PowerSchool?

*User Story* As an *educator (Teacher)*, I want to *log a student's
demonstrated mastery of a soft skill (e.g., "Grit" or "Communication") in a
class or setting* so that I can *add a verified competency to their LER
that is separate from an academic grade.*

   -

   *Scenario / Example*: During a project-based learning class (like The
   Crossing's "Family Time"), a student demonstrates exceptional perseveran=
ce.
   The *Teacher* uses the 0-4 rubric and awards a "badge" for that skill.
   -

   *Data / Inputs Involved*: Student ID, specific competency (e.g.,
   "Grit"), 0-4 rubric score, educator's digital signature (verification).
   -

   *Outputs / Decisions*: A new, verified "soft skill" entry appears in the
   student's "skills DNA".
   -

   *Why It Matters*: This is the core of the model=E2=80=94proving mastery =
of
   skills, not just seat time. It makes the invisible (soft skills) visible=
,
   valuable, and verifiable, which is a key requirement of the new Indiana
   Diplomas.

*User Story* As a *Learner (Student)*, I want to *complete a
self-assessment on a specific competency (hard or soft skill)* so that I
can *compare my self-perception with the formal verification from my
Teacher.*

   -

   *Scenario / Example*: After a project, a student rates themselves a "4"
   on "Collaboration." Their *Teacher* rates them a "3". This discrepancy
   becomes the starting point for a coaching conversation.
   -

   *Data / Inputs Involved*: Student 0-4 rubric input, *Teacher* 0-4 rubric
   input, specific competency tag.
   -

   *Outputs / Decisions*: The LER displays both the self-claimed score and
   the verified score, creating a clear framework for coaching.
   -

   *Why It Matters*: This empowers the student to take ownership of their
   learning, provides a clear framework for coaching, and builds the
   "self-assessment" muscle.

*User Story* As a *Learner (Student)*, I want to *upload a "portfolio
artifact" (e.g., a photo, video, or document)* so that I can *provide
tangible proof of my skill to back up a credential or verification.*

   -

   *Scenario / Example*: A student in a School-Based Enterprise (SBE)
   designs a new logo. They upload the final .jpg file to their LERN
   profile and tag it with the "Graphic Design" competency.
   -

   *Data / Inputs Involved*: The artifact itself (PDF, JPG, MP4),
   student-added description, relevant skill tags.
   -

   *Outputs / Decisions*: The artifact is stored in the LERN and linked to
   a specific skill claim.
   -

   *Why It Matters*: This moves beyond "claims" to "proof." It allows a
   student to *show* their work, not just *tell* about it, which is vital
   for creative and technical skills.

------------------------------

*Sharing & Verification*

*User Story* As a *WBL Partner (Industry Expert)*, I want to *receive a
simple request (e.g., via email) to complete a "Master-Evaluation" on a
student* so that I can *use the same 0-4 rubric as the school to formally
verify the student's competency in my workplace.*

   -

   *Scenario / Example*: A student is at their WBL site. The *Teacher
   (Mentor)* initiates a "Mastery Evaluation" request. The *Industry Expert
   (Master)* gets an email with a link to a simple form. The form lists the
   competency (e.g., "Brake Replacement") and the 0-4 rubric, which they fi=
ll
   out.
   -

   *Data / Inputs Involved*: Student ID, specific skill claim, Partner's
   contact info (email), 0-4 rubric.
   -

   *Outputs / Decisions*: A *third-party verified endorsement* from the
   employer is attached to the skill in the LER.
   -

   *Why It Matters*: This is the *most valuable verification* in the LERN.
   It creates the "triple-rating" (Self, Mentor, Master) and provides an
   external "trust signal" that is legible to all future employers.
   -

   *Open Questions*: How do we verify the *verifier* (i.e., ensure the
   email is going to a real manager)? How simple can we make this form to
   ensure high completion rates?

*User Story* As a *Learner (Student)*, I want to *generate a unique,
shareable link to a public-facing version of my LER* so that I can *include
it in a job application, resume, or college application.*

   -

   *Scenario / Example*: A student is applying for a job at a company
   outside the school's partner network. They log into LERN, click "Share,"
   and copy a URL to paste into the "Website" field of the online applicati=
on.
   -

   *Data / Inputs Involved*: Student's LER, student-selected sharing
   permissions.
   -

   *Outputs / Decisions*: A secure, read-only URL that presents the
   student's verified record in a clean UI.
   -

   *Why It Matters*: This is the "bridge" that makes the LER functional for
   job seeking *beyond* our immediate ecosystem.

------------------------------

*Employer Review*

*User Story* As an *Employer (Hiring Manager)*, I want to *click a link in
an application and immediately see a trusted, verified record of a
candidate's skills*, so that I can *quickly and confidently decide if they
are a good fit for an interview.*

   -

   *Scenario / Example*: A hiring manager opens a student's application,
   clicks the LERN link, and sees a clean dashboard. It shows skills,
   projects, portfolio artifacts, and verifiers (e.g., "Skill: Teamwork,
   Verified by: [School Name], [WBL Partner Name]").
   -

   *Data / Inputs Involved*: The public LERN link.
   -

   *Outputs / Decisions*: The employer views the LER, filters by hard/soft
   skills, and sees the "trust signals" from verifiers. They decide to
   shortlist the candidate.
   -

   *Why It Matters*: This solves the employer's biggest problem: "How do I
   know this resume is real?" It translates our internal "triple-rating"
   system into a simple, trusted, external signal.
   -

   *Open Questions*: What is the most critical information an employer
   wants to see in the first 5 seconds? How do we best visualize the "trust=
"
   (e.g., logos of verifiers)?

------------------------------

*Matching & Outcomes*

*User Story* As an *Employer (WBL Partner)*, I want to *post a job or
internship opportunity with specific skill requirements* so that I can *rec=
eive
a list of qualified candidates from the student talent pool.*

   -

   *Scenario / Example*: A WBL Partner posts an opening in LERN. They tag
   "Collaboration" (from the school's soft skill framework) and "Logistics
   Certification" (a hard credential) as required skills.
   -

   *Data / Inputs Involved*: Job description, required skills/tags,
   employer account.
   -

   *Outputs / Decisions*: The system suggests students whose LERNs have
   verified matches for those skills.
   -

   *Why It Matters*: This provides direct, measurable value to employers,
   which in turn secures more WBL partnerships and makes the entire ecosyst=
em
   sustainable. This directly leverages Josh's "AI Workflow Automation" ski=
ll.

------------------------------

*Performance & Goal Setting*

*User Story* As an *educator (Teacher)*, I want to *view and update a
student's "On/Off Track" dashboard for their A-B-C's (Attendance, Behavior,
Credits)*, so that I can *co-create and track 3-week cycle goals with the
student and parents.*

   -

   *Scenario / Example*: A *Teacher* opens a student's LERN profile. The
   dashboard shows a 66% attendance rate for the first 3-week cycle. The
   *Teacher* meets with the student, and they set a new goal for the
*next* 3-week
   cycle to reach 85%. This new goal and the real-time progress toward it a=
re
   now the central focus of the student's "Individual Student Plan".
   -

   *Data / Inputs Involved*: Attendance data (from SIS), Behavior data
   (from LERN/SIS), Credit Earning data (from LERN/SIS), 3-week cycle
   calendar, user-set goals.
   -

   *Outputs / Decisions*: A dynamic "Individual Student Plan" that is
   updated every 3 weeks. A dashboard that clearly visualizes progress towa=
rd
   the goal (On Track / Off Track).
   -

   *Why It Matters*: This transforms the LERN from a static *record* (like
   a transcript) into a dynamic *planning and performance tool*. It
   provides the "real-time" data needed for continuous improvement.
   -

   *Open Questions*: Where does the Behavior (B) data come from? Will
   *Teachers* log this directly in LERN? How are the A-B-C's weighted?

------------------------------

*Operational Automation (Internal Priority #1)*

*User Story* As an *Administrator (Principal or School Services Team)*, I
want to *run a report in LERN that automatically generates a formatted
export* for our SIS and state reporting, so that I can *eliminate manual,
human data entry and ensure our lag data is 100% accurate.*

   -

   *Scenario / Example*: It's the end of a 3-week cycle. The *Principal* ru=
ns
   a "State Reporting Export" in LERN. This report pulls all *newly
   verified* WBL hours and competencies and formats them perfectly to be
   uploaded into the *PowerSchool gradebook* (SIS) and the state's *INTERS
   database* (for CTE funding).
   -

   *Data / Inputs Involved*: Verified WBL hours, verified CTE competencies,
   student state ID, course codes.
   -

   *Outputs / Decisions*: A single, formatted export file that replaces
   multiple spreadsheets and hours of manual work.
   -

   *Why It Matters*: This is the *highest operational priority* for the
   beta customer. It provides immediate, massive ROI, frees up staff, and
   ensures financial sustainability by securing CTE funding. This is a perf=
ect
   use of Josh's 5-star "AI Workflow Automation" skill.
   -

   *Open Questions*: What exact data fields and column headers do
   PowerSchool and INTERS require? Is this a CSV export or a direct API
   integration?

------------------------------

*Summary for Review*


   -

   *Assumptions Made*:
   -

      We can create a simple, standardized taxonomy for both hard and soft
      skills (based on the 0-4 rubric) that is legible to employers.
      -

      We can establish a "chain of trust" where *verifiers* (Teachers,
      Industry Experts) are also verified by the system.
      -

      Schools will be the primary *customer* for the system, as it solves
      their operational reporting and funding-verification problems.
      -

      Students and Employers are the primary *users*.
      -

      The platform *must* be designed to act as a "school official" to
      comply with FERPA.
      -

   *Gaps / Unclear Areas*:
   -

      The precise process for verifying the *verifier* (e.g., ensuring the
      person endorsing from a WBL site is actually a manager) is undefined =
but
      critical for trust.
      -

      The technical interoperability with other LERs or state systems is a
      long-term goal but not clearly defined for Phase 1.
      -

   *Suggested First Prototypes (POC)*:
   1.

      *The "Internal Solution" (Highest Operational Priority)*: The *Admin
      Export* for PowerSchool/INTERS. This provides immediate, massive ROI
      for the beta customer.
      2.

      *The "Core Verification Loop"*: The *"Triple-Rating"* system. This
      includes the simplest possible forms for a *Teacher (Mentor)*
and *Industry
      Expert (Master)* to log a skill verification.
      3.

      *The "External Output"*: The *"Public Learner View."* A single,
      clean, shareable webpage that shows what a final record looks like to=
 an
      external employer.
      4.

      *The "Dynamic Dashboard"*: The *"On/Off Track"* performance
      dashboard. This is the primary interface for the student and *Teacher=
*