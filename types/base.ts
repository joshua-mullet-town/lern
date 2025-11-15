/**
 * Base entity fields shared by all Firestore documents
 */
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at?: Date;
}
