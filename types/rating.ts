import { BaseEntity } from './base';

/**
 * Who provided the rating
 */
export type RaterType = 'self' | 'mentor' | 'master';

/**
 * Rating score (0-4 scale)
 */
export type RatingScore = 0 | 1 | 2 | 3 | 4;

/**
 * Status of a rating
 * - pending: Awaiting rater's input
 * - completed: Rating submitted
 */
export type RatingStatus = 'pending' | 'completed';

/**
 * Artifact attached to a rating as evidence
 */
export interface RatingArtifact {
  file_url: string;         // Firebase Storage URL
  file_name: string;        // Original filename
  file_type: string;        // MIME type
  file_size: number;        // Bytes
  uploaded_at: Date;
}

/**
 * A competency assessment by self, mentor, or industry expert
 *
 * Ratings can be:
 * - Created as "completed" (immediate self-assessment)
 * - Created as "pending" (verification request to mentor/master)
 */
export interface Rating extends BaseEntity {
  learner_id: string;
  competency_id: string;
  rater_id: string;      // userId of person doing the rating
  rater_type: RaterType;
  score?: RatingScore;   // Optional until rating is completed
  status: RatingStatus;
  comment?: string;
  artifacts?: RatingArtifact[];  // Multiple files can be attached as evidence
}
