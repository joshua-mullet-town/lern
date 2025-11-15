import { BaseEntity } from './base';
import { Role } from './role';

/**
 * User account with role-based access
 * Can have multiple roles (e.g., educator AND learner)
 */
export interface User extends BaseEntity {
  email: string;
  org_id: string;
  roles: Role[];
  display_name: string;
  hidden_competency_ids?: string[];  // Competencies learner wants hidden from public profile
  competency_display_order?: string[];  // Custom order for displaying competencies on public profile
}
