import { BaseEntity } from './base';

/**
 * Type of organization
 */
export type OrgType = 'education' | 'employment';

/**
 * Represents a school, educational institution, or employer
 */
export interface Organization extends BaseEntity {
  name: string;
  org_type: OrgType;
}
