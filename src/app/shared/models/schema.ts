import {HalDoc} from '@shared/models/hateoas';
import {Uuid} from '@shared/models/metadata-document';

export interface Schema extends HalDoc {
  submissionDate: string;
  updateDate: string;
  user?: any;
  lastModifiedUser?: string;
  type?: string;
  uuid: Uuid;
  events?: any[];
  highLevelEntity: string;
  schemaVersion: string;
  domainEntity: string
  subDomainEntity: string
  concreteEntity: string
  compoundKeys: string
}
