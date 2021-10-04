import {ProjectFilters} from '@projects/models/project-filters';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {Project} from '../models/project';
import {MetadataDataSource} from './metadata-data-source';
import { omit, omitBy, isNil, keys } from 'lodash';

export class ProjectDataSource extends MetadataDataSource<Project> {
  private prevFilters: object;

  constructor(protected endpoint: PaginatedEndpoint<Project>) {
    super(endpoint, 'projects');
  }

  public applyFilters(filters: ProjectFilters) {
    const withoutNilAndEmptyString = omitBy(omitBy(filters, isNil), val => val === '') ;
    if (!this.prevFilters) {
      this.prevFilters = withoutNilAndEmptyString;
    }
    const removedFilterKeys = keys(this.prevFilters).filter(key => !keys(withoutNilAndEmptyString).includes(key));
    const withoutRemoved = omit({ ...this.getQueryData(), ...withoutNilAndEmptyString }, removedFilterKeys);
    this.setQueryData(withoutRemoved);
    this.prevFilters = withoutNilAndEmptyString;
  }
}
