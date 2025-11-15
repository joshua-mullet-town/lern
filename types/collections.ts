/**
 * Central mapping of TypeScript types to Firestore collection names
 *
 * Usage:
 *   collection(db, COLLECTION_NAMES.users)
 *   collection(db, COLLECTION_NAMES.competencies)
 *
 * This ensures consistency and makes it easy to find/update collection names.
 */
export const COLLECTION_NAMES = {
  organizations: 'organizations',
  users: 'users',
  competencies: 'competencies',
  ratings: 'ratings',
  artifacts: 'artifacts',
} as const;

/**
 * Type-safe collection name type
 */
export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];
