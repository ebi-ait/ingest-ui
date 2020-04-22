import {AuthenticationService} from "./authentication.service";
import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController, TestRequest} from "@angular/common/http/testing";
import {environment} from "../../environments/environment";

let accountService: AuthenticationService;
let remoteService: HttpTestingController

function setUp() {
  TestBed.configureTestingModule({
    providers: [AuthenticationService],
    imports: [HttpClientTestingModule],
  });

  accountService = TestBed.get(AuthenticationService);
  remoteService = TestBed.get(HttpTestingController);
}

describe('Get Account', () => {

  beforeEach(setUp);

  afterEach(() => {
    remoteService.verify();
  });

  it('should return an Account if the User is registered', (done) => {
    //expect:
    const accountId = 'c83bf90';
    const token = 'aGVsbG8sIHdvcmxkCg==';
    accountService.getAccount(token).subscribe(account => {
      expect(account).toBeTruthy();
      expect(account.id).toEqual(accountId);
      expect(account.roles).toContain('CONTRIBUTOR');
    });

    //given:
    const request = expectRemoteRequest(token, 'GET');
    request.flush({
      'id': accountId,
      'roles': [
        'CONTRIBUTOR'
      ],
    });

    //and:
    done();
  });

  it('should return empty object if the User is not registered', (done) => {
    //expect:
    const token = 'bWFnaWMgc3RyaW5nCg==';
    accountService.getAccount(token).subscribe(account => {
      expect(account).toEqual({});
    });

    //given:
    const request = expectRemoteRequest(token, 'GET');
    request.flush(null, { status: 404, statusText: 'not found' });

    //and:
    done();
  });

  function expectRemoteRequest(token: string, httpMethod?: string): TestRequest {
    const request = remoteService.expectOne(req => req.url.startsWith('http'));
    const authorization = request.request.headers.get('Authorization');
    expect(authorization).toEqual(`Bearer ${token}`);
    if (httpMethod) {
      expect(request.request.method).toEqual(httpMethod);
    }
    return request;
  };

});

describe('Account Registration', () => {

  beforeEach(setUp);

  it('should return Account data after registration', (done) => {
    //expect:
    const accountId = '72f9001';
    const providerReference = '127ee11';
    const token = 'ZW5jb2RlZCBzdHJpbmcK';
    accountService.register(token).subscribe(account => {
      expect(account).toBeTruthy();
      expect(account.id).toEqual(accountId);
      expect(account.providerReference).toEqual(providerReference);
      expect(account.roles).toContain('CONTRIBUTOR');
    });

    //given:
    const request = remoteService.expectOne(req => req.url.startsWith(environment.INGEST_API_URL));
    expect(request.request.method).toEqual('POST');

    //and:
    request.flush({
      'id': accountId,
      'providerReference': providerReference,
      'roles': ['CONTRIBUTOR'],
    })

    //and:
    done();
    remoteService.verify();
  });

});
