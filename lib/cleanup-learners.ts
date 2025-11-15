import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';

// Load .env.local
config({ path: '.env.local' });
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function cleanup() {
  console.log('🧹 Cleaning up extra learners...\n');

  // Get all users
  const usersSnapshot = await db.collection('users').get();
  
  const learnersToDelete: string[] = [];
  
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    const id = doc.id;
    
    // Keep only test-learner-main, delete all other learners
    if (data.roles?.includes('learner') && id !== 'test-learner-main') {
      learnersToDelete.push(id);
    }
  });

  if (learnersToDelete.length === 0) {
    console.log('✓ No extra learners found to delete\n');
  } else {
    console.log(`Found ${learnersToDelete.length} extra learner(s) to delete:`);
    for (const id of learnersToDelete) {
      await db.collection('users').doc(id).delete();
      console.log(`✓ Deleted: ${id}`);
    }
    console.log('');
  }

  console.log('✅ Cleanup complete!\n');
  process.exit(0);
}

cleanup().catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
