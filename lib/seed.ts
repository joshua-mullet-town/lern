/**
 * Seed script to populate Firestore with demo data
 *
 * Run with: npm run seed
 *
 * Creates:
 * - 1 organization (Demo High School)
 * - 1 educator
 * - 2 learners
 * - 5 competencies (mix of hard/soft skills)
 * - Sample ratings
 */

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';

// Load .env.local
config({ path: '.env.local' });
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type {
  Organization,
  User,
  Competency,
  Rating,
} from '../types';
import { COLLECTION_NAMES, DEFAULT_RUBRIC } from '../types';

// Initialize Admin SDK
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

// Demo IDs (hardcoded for POC)
// NOTE: These IDs are used across all interfaces for testing
const ORG_ID = 'demo-org-456';
const EDUCATOR_ID = 'demo-educator-123';
const TEST_LEARNER_ID = 'test-learner-main'; // Used by /learner page
const TEST_EMPLOYER_ID = 'test-employer-main'; // Used by /master page

async function cleanupDatabase() {
  console.log('🧹 Wiping existing database...\n');

  const collections = [
    COLLECTION_NAMES.ratings,
    COLLECTION_NAMES.artifacts,
    COLLECTION_NAMES.competencies,
    COLLECTION_NAMES.users,
    COLLECTION_NAMES.organizations,
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`✓ Deleted ${snapshot.size} documents from ${collectionName}`);
  }

  console.log('');
}

async function seed() {
  console.log('🌱 Seeding Firestore with demo data...\n');

  // Wipe existing data first
  await cleanupDatabase();

  // 1. Create organization
  console.log('Creating organization...');
  const org: Omit<Organization, 'id'> = {
    name: 'Demo High School',
    org_type: 'education',
    created_at: new Date(),
  };
  await db.collection(COLLECTION_NAMES.organizations).doc(ORG_ID).set({
    ...org,
    created_at: Timestamp.now(),
  });
  console.log(`✓ Organization created: ${ORG_ID}\n`);

  // 2. Create educator
  console.log('Creating educator...');
  const educator: Omit<User, 'id'> = {
    email: 'educator@demo.edu',
    org_id: ORG_ID,
    roles: ['educator'],
    display_name: 'Jane Educator',
    created_at: new Date(),
  };
  await db.collection(COLLECTION_NAMES.users).doc(EDUCATOR_ID).set({
    ...educator,
    created_at: Timestamp.now(),
  });
  console.log(`✓ Educator created: ${EDUCATOR_ID}\n`);

  // 3. Create test learner (main one used for testing)
  console.log('Creating test users...');
  const testLearner: Omit<User, 'id'> = {
    email: 'demo.student@demo.edu',
    org_id: ORG_ID,
    roles: ['learner'],
    display_name: 'Demo Student',
    created_at: new Date(),
  };
  await db.collection(COLLECTION_NAMES.users).doc(TEST_LEARNER_ID).set({
    ...testLearner,
    created_at: Timestamp.now(),
  });
  console.log(`✓ Demo Student created: ${TEST_LEARNER_ID} (used by /learner page)`);

  // 4. Create test employer (main one used for testing)
  const testEmployer: Omit<User, 'id'> = {
    email: 'test@employer.demo',
    org_id: ORG_ID,
    roles: ['industry_expert'],
    display_name: '🧪 Test Employer (Main)',
    created_at: new Date(),
  };
  await db.collection(COLLECTION_NAMES.users).doc(TEST_EMPLOYER_ID).set({
    ...testEmployer,
    created_at: Timestamp.now(),
  });
  console.log(`✓ Test Employer created: ${TEST_EMPLOYER_ID} (used by /master page)\n`);

  // 4. Create competencies with fixed IDs (prevents duplicates)
  console.log('Creating competencies...');
  const competencyDefs = [
    {
      id: 'comp-python',
      org_id: ORG_ID,
      created_by: EDUCATOR_ID,
      title: 'Python Programming',
      description: 'Ability to write Python code for data analysis and automation',
      type: 'hard' as const,
      rubric: DEFAULT_RUBRIC,
      created_at: new Date(),
    },
    {
      id: 'comp-critical-thinking',
      org_id: ORG_ID,
      created_by: EDUCATOR_ID,
      title: 'Critical Thinking',
      description: 'Analyze complex problems and develop reasoned solutions',
      type: 'soft' as const,
      rubric: DEFAULT_RUBRIC,
      created_at: new Date(),
    },
    {
      id: 'comp-web-dev',
      org_id: ORG_ID,
      created_by: EDUCATOR_ID,
      title: 'Web Development (HTML/CSS/JS)',
      description: 'Build responsive web applications using modern frameworks',
      type: 'hard' as const,
      rubric: DEFAULT_RUBRIC,
      created_at: new Date(),
    },
    {
      id: 'comp-collaboration',
      org_id: ORG_ID,
      created_by: EDUCATOR_ID,
      title: 'Collaboration',
      description: 'Work effectively in teams and communicate clearly',
      type: 'soft' as const,
      rubric: DEFAULT_RUBRIC,
      created_at: new Date(),
    },
    {
      id: 'comp-data-analysis',
      org_id: ORG_ID,
      created_by: EDUCATOR_ID,
      title: 'Data Analysis',
      description: 'Interpret data, create visualizations, and draw insights',
      type: 'hard' as const,
      rubric: DEFAULT_RUBRIC,
      created_at: new Date(),
    },
  ];

  for (const comp of competencyDefs) {
    const { id, ...competency } = comp;
    await db.collection(COLLECTION_NAMES.competencies).doc(id).set({
      ...competency,
      created_at: Timestamp.now(),
    });
    console.log(`✓ Competency created: ${competency.title} (${id})`);
  }
  console.log('');

  // 6. Create sample ratings with historical data (fixed IDs to prevent duplicates)
  console.log('Creating sample ratings for Test Learner...');

  // Helper to create date X days ago
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const ratingDefs = [
    // ===== PYTHON PROGRAMMING - progression over time =====
    // Initial self-assessment (90 days ago)
    {
      id: 'rating-python-self-0',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 1,
      status: 'completed' as const,
      comment: 'Complete beginner, just installed Python',
      created_at: daysAgo(90),
    },
    {
      id: 'rating-python-self-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Just starting to learn Python basics',
      created_at: daysAgo(60),
    },
    {
      id: 'rating-python-mentor-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Shows promise, needs consistent practice',
      created_at: daysAgo(55),
    },
    {
      id: 'rating-python-self-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Completed several Python projects including a data scraper',
      created_at: daysAgo(30),
    },
    {
      id: 'rating-python-mentor-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Good progress, needs more practice with advanced concepts',
      created_at: daysAgo(25),
    },
    {
      id: 'rating-python-master-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Solid work on the internship project',
      created_at: daysAgo(10),
    },
    {
      id: 'rating-python-self-3',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 4,
      status: 'completed' as const,
      comment: 'Feeling confident with Python now',
      created_at: daysAgo(7),
    },
    {
      id: 'rating-python-mentor-3',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 4,
      status: 'completed' as const,
      comment: 'Excellent work on final project. Ready for production code.',
      created_at: daysAgo(5),
    },

    // ===== WEB DEVELOPMENT - progression =====
    {
      id: 'rating-web-self-0',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 1,
      status: 'completed' as const,
      comment: 'Started with HTML basics',
      created_at: daysAgo(70),
    },
    {
      id: 'rating-web-self-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Learning HTML and CSS fundamentals',
      created_at: daysAgo(45),
    },
    {
      id: 'rating-web-mentor-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Good start with layouts and styling',
      created_at: daysAgo(40),
    },
    {
      id: 'rating-web-self-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Built several responsive sites, learning React',
      created_at: daysAgo(20),
    },
    {
      id: 'rating-web-mentor-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Solid fundamentals, good eye for design',
      created_at: daysAgo(15),
    },
    {
      id: 'rating-web-master-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Clean code, responsive designs',
      created_at: daysAgo(12),
    },
    {
      id: 'rating-web-self-3',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 4,
      status: 'completed' as const,
      comment: 'Completed full-stack project with Next.js',
      created_at: daysAgo(6),
    },
    // Master rating pending (for /master page)
    {
      id: 'rating-web-master-pending',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(2),
    },

    // ===== DATA ANALYSIS - steady progression =====
    {
      id: 'rating-data-self-0',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 1,
      status: 'completed' as const,
      comment: 'Learning Excel and basic statistics',
      created_at: daysAgo(50),
    },
    {
      id: 'rating-data-self-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Learning pandas and matplotlib',
      created_at: daysAgo(35),
    },
    {
      id: 'rating-data-mentor-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 2,
      status: 'completed' as const,
      comment: 'Good start, focus on statistical concepts',
      created_at: daysAgo(30),
    },
    {
      id: 'rating-data-self-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Created first data visualization dashboard',
      created_at: daysAgo(18),
    },
    {
      id: 'rating-data-mentor-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: EDUCATOR_ID,
      rater_type: 'mentor' as const,
      score: 3,
      status: 'completed' as const,
      comment: 'Strong work on the analysis project',
      created_at: daysAgo(14),
    },
    // Master rating pending
    {
      id: 'rating-data-master-pending',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(1),
    },

    // ===== CRITICAL THINKING - pending self-assessment =====
    {
      id: 'rating-critical-self-pending',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-critical-thinking',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      status: 'pending' as const,
      created_at: daysAgo(3),
    },

    // ===== COLLABORATION - multiple pending master ratings =====
    {
      id: 'rating-collab-master-pending-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-collaboration',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(5),
    },
    {
      id: 'rating-collab-master-pending-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-collaboration',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(4),
    },
    {
      id: 'rating-collab-master-pending-3',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-collaboration',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(3),
    },

    // ===== PYTHON - additional pending master ratings =====
    {
      id: 'rating-python-master-pending-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(2),
    },
    {
      id: 'rating-python-master-pending-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-python',
      rater_id: TEST_EMPLOYER_ID,
      rater_type: 'master' as const,
      status: 'pending' as const,
      created_at: daysAgo(1),
    },

    // ===== CRITICAL THINKING - additional pending self-assessments =====
    {
      id: 'rating-critical-self-pending-2',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-critical-thinking',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      status: 'pending' as const,
      created_at: daysAgo(2),
    },
    {
      id: 'rating-critical-self-pending-3',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-critical-thinking',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      status: 'pending' as const,
      created_at: daysAgo(1),
    },

    // ===== WEB DEV - additional pending self-assessment =====
    {
      id: 'rating-web-self-pending-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-web-dev',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      status: 'pending' as const,
      created_at: daysAgo(1),
    },

    // ===== DATA ANALYSIS - additional pending self-assessment =====
    {
      id: 'rating-data-self-pending-1',
      learner_id: TEST_LEARNER_ID,
      competency_id: 'comp-data-analysis',
      rater_id: TEST_LEARNER_ID,
      rater_type: 'self' as const,
      status: 'pending' as const,
      created_at: daysAgo(1),
    },
  ];

  for (const ratingDef of ratingDefs) {
    const { id, created_at, ...rating } = ratingDef;
    await db.collection(COLLECTION_NAMES.ratings).doc(id).set({
      ...rating,
      created_at: Timestamp.fromDate(created_at),
    });
    console.log(`✓ Rating created: ${rating.status} ${rating.rater_type} rating for ${id}`);
  }

  // 7. Create artifacts (exported from actual uploads)
  console.log('\nCreating artifacts...');
  const artifactDefs = [
    {
      id: 'artifact-agent-billy-logo',
      uploaded_by: TEST_LEARNER_ID,
      learner_id: TEST_LEARNER_ID,
      file_url: 'https://firebasestorage.googleapis.com/v0/b/lern-poc.firebasestorage.app/o/artifacts%2Ftest-learner-main%2F1763188408457_agent-billy-logo.png?alt=media&token=bdee4b50-2fd3-4d7c-90fd-4e2e577f701f',
      file_type: 'png',
      file_size: 556740,
      file_name: 'agent-billy-logo',
      competency_ids: ['comp-data-analysis'],
      created_at: daysAgo(10),
    },
    {
      id: 'artifact-important-doc',
      uploaded_by: TEST_LEARNER_ID,
      learner_id: TEST_LEARNER_ID,
      file_url: 'https://firebasestorage.googleapis.com/v0/b/lern-poc.firebasestorage.app/o/artifacts%2Ftest-learner-main%2F1763193786782_Important%20Document.pdf?alt=media&token=6284fc94-3217-42d4-ab1d-9bbaa7ef0fdf',
      file_type: 'pdf',
      file_size: 40051,
      file_name: 'Important Document',
      competency_ids: ['comp-web-dev'],
      created_at: daysAgo(8),
    },
    {
      id: 'artifact-garage-sale',
      uploaded_by: TEST_LEARNER_ID,
      learner_id: TEST_LEARNER_ID,
      file_url: 'https://firebasestorage.googleapis.com/v0/b/lern-poc.firebasestorage.app/o/artifacts%2Ftest-learner-main%2F1763188428208_4676a9b4-c13a-49fc-9ee0-e13d25000c0c.jpg?alt=media&token=f1242993-760f-42dc-89d0-c63f18706d02',
      file_type: 'jpg',
      file_size: 2601262,
      file_name: 'garage sale',
      competency_ids: ['comp-critical-thinking'],
      created_at: daysAgo(12),
    },
  ];

  for (const artifactDef of artifactDefs) {
    const { id, created_at, ...artifact } = artifactDef;
    await db.collection(COLLECTION_NAMES.artifacts).doc(id).set({
      ...artifact,
      created_at: Timestamp.fromDate(created_at),
      updated_at: Timestamp.fromDate(created_at),
    });
    console.log(`✓ Artifact created: ${artifact.file_name} (${artifact.file_type})`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('🎯 Testing Guide:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📚 Educator Page (/competencies, /learners):`);
  console.log(`   - Educator ID: ${EDUCATOR_ID}`);
  console.log(`   - Create ratings for: "Demo Student"`);
  console.log('');
  console.log(`🎓 Learner Page (/learner):`);
  console.log(`   - Hardcoded to: ${TEST_LEARNER_ID} (Demo Student)`);
  console.log(`   - Should see 5 pending self-assessments`);
  console.log('');
  console.log(`👔 Employer Page (/master):`);
  console.log(`   - Hardcoded to: ${TEST_EMPLOYER_ID}`);
  console.log(`   - Should see 7 pending rating requests for Demo Student`);
  console.log('');
  console.log(`🏢 Organization: ${ORG_ID}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
