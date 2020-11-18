import {IngestDataSource} from './ingest-data-source';
import {PagedData} from '../../../models/page';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {IngestService} from '../../../services/ingest.service';


export class MetadataDataSource extends IngestDataSource<any> {
  private validResourceTypes = ['biomaterials', 'protocols', 'files', 'processes'];

  constructor(protected ingestService: IngestService,
              protected endpoint: string,
              protected resourceType: string) {
    super(ingestService, endpoint, resourceType);
    if (this.validResourceTypes.indexOf(this.resourceType) < 0) {
      throw new Error(`${this.resourceType} is not a valid metadata resource type.`);
    }
  }

  fetchData(params?: any): Observable<PagedData<any>> {
    return super.fetchData(params).pipe(
      map(data => {
          // TODO always get the content for now
          return {
            data: data.data.map(resource => resource['content']),
            page: data.page
          };
        }
      ));
  }
}
