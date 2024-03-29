import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {INVALID_FILE_TYPES_AND_CODES, METADATA_VALIDATION_STATES} from '@shared/constants';
import {IngestService} from './ingest.service';
import {MetadataDocument} from '@shared/models/metadata-document';
import {Project} from '@shared/models/project';

describe('Ingest Service', () => {
  let service: IngestService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const api_url = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IngestService],
      imports: [HttpClientTestingModule]
    });


    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(IngestService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('query entity functions', () => {
    const metaDoc: MetadataDocument = {
      content: {},
      submissionDate: '',
      updateDate: '',
      lastModifiedUser: '',
      type: '',
      uuid: {
        uuid: 'my random name'
      },
      events: [],
      dcpVersion: '',
      validationState: '',
      validationErrors: [],
      isUpdate: false,
      _links: {
        self:{
          href:'sub/id'
        }
      }
    };

    const mockList = {
      _embedded: [metaDoc]
    };

    const criteria = [{
      field: 'mockField',
      operator: 'AND',
      value: 'mockValue'
    }, {
      field: 'mockField2',
      operator: 'AND',
      value: 'mockValue2'
    }];

    it(`should work for getQueryEntity and a real entityType`, () => {
      service.getQueryEntity('protocols')(criteria).subscribe(res => expect(res._embedded?.[0]?.uuid?.uuid).toEqual('my random name'));

      const req = httpTestingController.expectOne(`${api_url}/protocols/query`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(criteria);
      req.flush(mockList);
    });

    it(`should fail for getQueryEntity and a fake entityType`, () => {
      expect(() => service.getQueryEntity('beeblebrox')).toThrow();
    });

    const makeTest = name => {
      it(`should work for query${name}`, () => {
        const funcName = `query${name.charAt(0).toUpperCase()}${name.slice(1)}`;

        service[funcName](criteria).subscribe(res => expect(res?._embedded?.[0]?.uuid?.uuid).toEqual('my random name'));

        const req = httpTestingController.expectOne(`${api_url}/${name}/query`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(criteria);
        req.flush(mockList);
      });
    };

    ['files', 'protocols', 'biomaterials', 'processes', 'projects'].forEach(makeTest);

    it(`should work for queryProjects as Project type`, () => {
      service.queryProjects(criteria).subscribe(res => {
        const project: Project = res._embedded?.[0];
        expect(project?.uuid?.uuid).toEqual('my random name');
      });
      const req = httpTestingController.expectOne(`${api_url}/projects/query`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(criteria);
      req.flush(mockList);
    });
  });

  describe('standard CRUD helpers', () => {
    it('should get the given url', () => {
      const url = '42.com/meaning/life';
      service.get(url).subscribe(() => {});
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
    });

    it('should get the given url with options', () => {
      const url = '42.com/meaning/life';
      service.get(url, { params: { page: '42' }}).subscribe(() => {});
      const req = httpTestingController.expectOne(`${url}?page=42`);
      expect(req.request.method).toEqual('GET');
    });

    it('should send a PUT request to the given url', () => {
      const url = '42.com/meaning/life';
      const body = {
        name: 'Zaphod'
      };
      service.put(url, body).subscribe(() => {});
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(body);
    });

    it('should send a PATCH request to the given url', () => {
      const url = '42.com/meaning/life';
      const body = {
        name: 'Zaphod'
      };
      service.patch(url, body).subscribe(() => {});
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(body);
    });
  });

  describe('fetchSubmissionData', () => {
    const submissionId = 'mockEnvelope';
    const entityType = 'mockEntity';

    it('should use the base url when no sort or filtering params are given', () => {
      service.fetchSubmissionData({ submissionId, entityType }).subscribe(() => {});
      const req = httpTestingController.expectOne(`${api_url}/submissionEnvelopes/${submissionId}/${entityType}`);
      expect(req.request.method).toEqual('GET');
    })

    const expectSort = (req) => expect(req.request.params.has('sort')).toBeTruthy();

    it('should use the findBySubmissionEnvelope endpoint when there is a sort parameter', () => {
      service.fetchSubmissionData({
        submissionId,
        entityType,
        sort: { column: 'test', direction: 'test' }
      }).subscribe(() => {});

      const req = httpTestingController.expectOne(({url}) => url.includes('findBySubmissionEnvelope'));
      expect(req.request.method).toEqual('GET');
      expectSort(req);
    });

    it('should use the findBySubmissionIdWithGraphValidationErrors endpoint when GraphInvalid filter state is given', () =>{
      service.fetchSubmissionData({
        submissionId,
        entityType,
        sort: { column: 'test', direction: 'test' },
        filterState: METADATA_VALIDATION_STATES.GraphInvalid
      }).subscribe(() => {});

      const req = httpTestingController.expectOne(({url}) => url.includes('findBySubmissionIdWithGraphValidationErrors'));
      expect(req.request.method).toEqual('GET');
      expectSort(req);
    });

    it('should use the findBySubmissionEnvelopeAndValidationState endpoint when a metadata filter state is given', () =>{
      service.fetchSubmissionData({
        submissionId,
        entityType: 'files',
        sort: { column: 'test', direction: 'test' },
        filterState: METADATA_VALIDATION_STATES.Invalid
      }).subscribe(() => {});

      const req = httpTestingController.expectOne(({url}) => url.includes('findBySubmissionEnvelopeAndValidationState'));
      expect(req.request.method).toEqual('GET');
      expectSort(req);
    });

    it('should use the findBySubmissionEnvelopeIdAndErrorType endpoint when a file validation state filter is given', () =>{
      service.fetchSubmissionData({
        submissionId,
        entityType: 'files',
        sort: { column: 'test', direction: 'test' },
        filterState: INVALID_FILE_TYPES_AND_CODES[0].humanFriendly
      }).subscribe(() => {});

      const req = httpTestingController.expectOne(({url}) => url.includes('findBySubmissionEnvelopeIdAndErrorType'));
      expect(req.request.method).toEqual('GET');
      expectSort(req);
    });

    it('should pass through page and size', () => {
      service.fetchSubmissionData({
        submissionId,
        entityType,
        page: 0,
        size: 20
      }).subscribe(() => {});
      const req = httpTestingController.expectOne(`${api_url}/submissionEnvelopes/${submissionId}/${entityType}?page=0&size=20`);
      expect(req.request.method).toEqual('GET');
    })
  });
});
