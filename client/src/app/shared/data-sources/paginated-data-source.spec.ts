import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {PaginatedDataSource} from './paginated-data-source';
import {IngestService} from '../services/ingest.service';
describe('PaginatedDataSource', () => {
    let ingestSvc: SpyObj<IngestService>;
    let dataSource: PaginatedDataSource<any>;

    beforeEach(() => {
        ingestSvc = jasmine.createSpyObj('IngestService', ['get']);
        dataSource = new PaginatedDataSource<any>(params => ingestSvc.get('http://fakeurl.com/biomaterials', params));
    });

    describe('connect', () => {
        it('returns paged data object', (done) => {
            const mockedResponse = {
                'page': {
                    'size': 20,
                    'totalElements': 3,
                    'totalPages': 1,
                    'number': 0
                },
                '_embedded': {
                    'biomaterials': []
                }
            };

            ingestSvc.get.and.returnValue(of(mockedResponse));
            dataSource.connect().subscribe(
            data => {
                    expect(data.page.size).toBe(20);
                    expect(data.page.totalElements).toBe(3);
                    expect(ingestSvc.get).toHaveBeenCalledWith('http://fakeurl.com/biomaterials', { page: 0, size: 20});
                    done();
                }
            );
        });

        it('allows for subscribing to result$ and return value of connect', () => {
            const returnVal = dataSource.connect();
            expect(dataSource.result$).toBe(returnVal);
        });

        it('changes the page', (done) => {
            dataSource.fetch(2, 10);
            dataSource.connect();
            expect(ingestSvc.get).toHaveBeenCalledWith('http://fakeurl.com/biomaterials', { page: 2, size: 10});
            done();
        });

        it('sorts the page', (done) => {
            dataSource.sortBy('mycol', 'desc');
            dataSource.connect();
            expect(ingestSvc.get).toHaveBeenCalledWith(
                'http://fakeurl.com/biomaterials', { page: 0, size: 20, sort: {column: 'mycol', direction: 'desc'}}
                );
            done();
        });
    });
});
