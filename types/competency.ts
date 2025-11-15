import { BaseEntity } from './base';

/**
 * Type of skill being assessed
 */
export type CompetencyType = 'hard' | 'soft';

/**
 * Rating scale descriptions (0-4)
 */
export interface RubricScale {
  0: string;  // "No evidence"
  1: string;  // "Beginning"
  2: string;  // "Developing"
  3: string;  // "Proficient"
  4: string;  // "Expert"
}

/**
 * A defined skill or competency that can be assessed
 * Created by educators, rated by learners/mentors/masters
 */
export interface Competency extends BaseEntity {
  org_id: string;
  created_by: string;  // userId of educator who created it
  title: string;
  description: string;
  type: CompetencyType;
  rubric?: RubricScale;  // Optional: custom rubric (uses DEFAULT_RUBRIC if not set)
}

/**
 * Default rubric for new competencies
 */
export const DEFAULT_RUBRIC: RubricScale = {
  0: "No evidence",
  1: "Beginning",
  2: "Developing",
  3: "Proficient",
  4: "Expert",
};
