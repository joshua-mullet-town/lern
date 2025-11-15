import { BaseEntity } from './base';

/**
 * Allowed artifact file types
 */
export type ArtifactFileType = 'pdf' | 'jpg' | 'png' | 'mp4';

/**
 * Uploaded portfolio evidence (PDF, images, videos)
 * Can be linked to multiple competencies
 */
export interface Artifact extends BaseEntity {
  uploaded_by: string;  // userId
  learner_id: string;   // Owner of the artifact
  file_url: string;     // Firebase Storage URL
  file_type: ArtifactFileType;
  file_size: number;    // Bytes
  file_name: string;    // Original filename
  competency_ids: string[];  // Links to 1+ competencies
}

/**
 * Max file size: 50MB
 */
export const MAX_ARTIFACT_SIZE = 50 * 1024 * 1024;
