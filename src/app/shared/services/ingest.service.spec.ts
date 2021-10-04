import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {IngestService} from './ingest.service';

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
    const mockList = {
      name: 'my random name'
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

      // TODO: Remove ts-ignore and mock returned ListResult properly
      // @ts-ignore
      service.getQueryEntity('protocols')(criteria).subscribe(res => expect(res.name).toEqual('my random name'));

      const req = httpTestingController.expectOne(`${api_url}/protocols/query`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(criteria);
      req.flush(mockList);
    });

    it(`should fail for getQueryEntity and a fake entityType`, () => {

      // TODO: Remove ts-ignore and mock returned ListResult properly
      // @ts-ignore
      expect(() => service.getQueryEntity('beeblebrox')).toThrow();
    });


    const makeTest = name => {
      it(`should work for ${name}`, () => {
        const funcName = `query${name.charAt(0).toUpperCase()}${name.slice(1)}`;

        // TODO: Remove ts-ignore and mock returned ListResult properly
        // @ts-ignore
        service[funcName](criteria).subscribe(res => expect(res.name).toEqual('my random name'));

        const req = httpTestingController.expectOne(`${api_url}/${name}/query`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(criteria);
        req.flush(mockList);
      });
    };

    ['files', 'protocols', 'biomaterials', 'processes', 'projects'].forEach(makeTest);
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
});
