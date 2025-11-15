#!/usr/bin/env tsx

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

async function exportArtifacts() {
  console.log('📥 Exporting artifacts from Firestore...\n');

  const snapshot = await db.collection('artifacts').get();
  const artifacts: Record<string, unknown>[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    artifacts.push({
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  });

  console.log(`Found ${artifacts.length} artifacts\n`);
  console.log(JSON.stringify(artifacts, null, 2));
}

exportArtifacts()
  .then(() => {
    console.log('\n✅ Export complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error exporting artifacts:', error);
    process.exit(1);
  });
