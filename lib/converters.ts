/**
 * Firestore data converters for type-safe document reads/writes
 *
 * Usage (client SDK):
 *   const ref = collection(db, COLLECTION_NAMES.users).withConverter(UserConverter);
 *   const users = await getDocs(ref);  // Fully typed!
 *
 * Usage (admin SDK):
 *   const ref = adminDb.collection(COLLECTION_NAMES.users);
 *   const doc = await ref.doc(userId).get();
 *   const user = convertFirestoreDoc<User>(doc);
 */

import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type {
  User,
  Organization,
  Competency,
  Rating,
  Artifact,
} from '@/types';

/**
 * Helper: Convert Firestore Timestamp to Date
 */
function timestampToDate(timestamp: any): Date {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  return new Date(timestamp);
}

/**
 * Helper: Convert Date to Firestore Timestamp for writes
 */
function dateToTimestamp(date: Date | Timestamp | undefined): any {
  if (!date) return undefined;
  // If already a Timestamp, return as-is
  if (date instanceof Timestamp) return date;
  // Convert Date to Timestamp
  return Timestamp.fromDate(date);
}

/**
 * Generic converter for any entity type
 * Handles ID stripping on write, timestamp conversion on read
 */
function createConverter<T extends { id: string; created_at: Date }>(
): FirestoreDataConverter<T> {
  return {
    toFirestore: (entity: T) => {
      const { id, created_at, updated_at, ...data } = entity as any;
      return {
        ...data,
        created_at: dateToTimestamp(created_at) || Timestamp.now(),
        updated_at: dateToTimestamp(updated_at),
      };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
      const data = snapshot.data();
      return {
        ...data,
        id: snapshot.id,
        created_at: timestampToDate(data.created_at),
        updated_at: data.updated_at ? timestampToDate(data.updated_at) : undefined,
      } as unknown as T;
    },
  };
}

/**
 * Converters for each entity type
 */
export const OrganizationConverter = createConverter<Organization>();
export const UserConverter = createConverter<User>();
export const CompetencyConverter = createConverter<Competency>();
export const RatingConverter = createConverter<Rating>();
export const ArtifactConverter = createConverter<Artifact>();

/**
 * Helper for Admin SDK: Convert a Firestore DocumentSnapshot to typed entity
 * (Admin SDK doesn't support withConverter in the same way)
 */
export function convertFirestoreDoc<T extends { id: string; created_at: Date }>(
  doc: any
): T | null {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at: timestampToDate(data.created_at),
    updated_at: data.updated_at ? timestampToDate(data.updated_at) : undefined,
  } as T;
}

/**
 * Helper for Admin SDK: Convert query snapshot to typed array
 */
export function convertFirestoreDocs<T extends { id: string; created_at: Date }>(
  snapshot: any
): T[] {
  return snapshot.docs.map((doc: any) => convertFirestoreDoc<T>(doc)).filter(Boolean);
}
