import {XhrFactory} from "@angular/common";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpParams,
  HttpXhrBackend,
} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {Ontology} from "@shared/models/ontology";
import {of} from 'rxjs';
import {JsonSchema} from '@metadata-schema-form/models/json-schema';
import {JsonSchemaProperty} from '@metadata-schema-form/models/json-schema-property';
import {Metadata} from '@metadata-schema-form/models/metadata';
import {OlsHttpResponse, OlsRequestParamsDefaults, OlsResponse} from '../models/ols';
import {OntologyService} from './ontology.service';

describe('OntologyService', () => {
  function createTestSchema(): JsonSchema {
    return {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$id': 'https://schema.dev.data.humancellatlas.org/module/ontology/1.0.0/contributor_role_ontology',
      'description': 'A term that describes the role of a contributor in the project.',
      'additionalProperties': false,
      'required': [
        'text'
      ],
      'title': 'Contributor role ontology',
      'name': 'contributor_role_ontology',
      'type': 'object',
      'properties': {
        'text': {
          'description': 'The primary role of the contributor in the project.',
          'type': 'string',
          'example': 'principal investigator; experimental scientist',
          'user_friendly': 'Contributor role'
        },
        'ontology': {
          'description': 'An ontology term identifier in the form prefix:accession.',
          'type': 'string',
          'graph_restriction': {
            'ontologies': [
              'obo:efo'
            ],
            'classes': [
              'BFO:0000023'
            ],
            'relations': [
              'rdfs:subClassOf'
            ],
            'direct': false,
            'include_self': false
          },
          'example': 'EFO:0009736; EFO:0009741',
          'user_friendly': 'Contributor role ontology ID'
        },
        'ontology_label': {
          'description': 'The preferred label for the ontology term referred to in the ontology field. This may differ from the user-supplied value in the text field.',
          'type': 'string',
          'example': 'principal investigator; experimental scientist',
          'user_friendly': 'Contributor role ontology label'
        }
      }
    };
  }

  function creatOlsResponse() :OlsResponse{
    return {
      'numFound': 1,
      'start': 0,
      'docs': [
        {
          'id': 'efo:class:http://www.ebi.ac.uk/efo/EFO_0009736',
          'iri': 'http://www.ebi.ac.uk/efo/EFO_0009736',
          'short_form': 'EFO_0009736',
          'obo_id': 'EFO:0009736',
          'label': 'principal investigator',
          'ontology_name': 'efo',
          'ontology_prefix': 'EFO',
          'type': 'class'
        }
      ]
    };
  }

  function createOlsHttpResponse(olsResponse: OlsResponse):OlsHttpResponse {
    return {highlighting: [], response: olsResponse, responseHeader: {status:0, QTime:1, params:undefined}};
  }

  describe('createSearchParams', () => {
    let service: OntologyService;
    let http: jasmine.SpyObj<HttpClient>;

    let schema: JsonSchema;
    let metadata: Metadata;
    let olsHttpResponse: OlsHttpResponse;

    beforeEach(() => {
      http = jasmine.createSpyObj(['get']);
      service = new OntologyService(http);

      schema = createTestSchema();

      metadata = new Metadata({
        schema: schema as JsonSchemaProperty,
        key: 'project_role',
        isRequired: false
      });

      const olsResponse: OlsResponse = creatOlsResponse();
      olsHttpResponse = createOlsHttpResponse(olsResponse);

    });

    it('should return correct search params when given a schema', (done) => {
      // given
      http.get.and.returnValue(of(olsHttpResponse));

      // when
      const output = service.createSearchParams(schema, 'text');

      // then

      output.subscribe(data => {
        expect(data).toEqual({
          ...OlsRequestParamsDefaults,
          ontology: 'efo',
          allChildrenOf: 'http://www.ebi.ac.uk/efo/EFO_0009736',
          q: 'text',
        });
      });

      done();
    });

    it('should return correct search params when schema is undefined', (done) => {
      // given

      // when
      const output = service.createSearchParams(undefined, undefined);

      // then
      output.subscribe(data => {
        expect(data).toEqual({
          ...OlsRequestParamsDefaults,
          q: '*',
        });
      });

      done();
    });

    it('should work when ols returns 2 results', (done) => {
      // given
      const olsResponseWith2Docs = {
        highlighting: [], responseHeader: undefined,
        "response": {
          "numFound": 2,
          "start": 0,
          "docs": [
            {
              "id": "efo:class:http://purl.obolibrary.org/obo/BFO_0000023",
              "iri": "http://purl.obolibrary.org/obo/BFO_0000023",
              "short_form": "BFO_0000023",
              "obo_id": "BFO:0000023",
              "label": "role",
              "ontology_name": "efo",
              "ontology_prefix": "EFO",
              "type": "class"
            },
            {
              "id": "hcao:class:http://purl.obolibrary.org/obo/BFO_0000023",
              "iri": "http://purl.obolibrary.org/obo/BFO_0000023",
              "short_form": "BFO_0000023",
              "obo_id": "BFO:0000023",
              "label": "role",
              "ontology_name": "hcao",
              "ontology_prefix": "HCAO",
              "type": "class"
            }
          ]
        },
      }
      http.get.and.returnValue(of(olsResponseWith2Docs));
      service.createSearchParams(schema, 'text')
        .subscribe(searchParams => {

          done();
        })
    })

  });

  describe('ontology lookup -  Live http calls', () => {
    class BrowserXhr implements XhrFactory {
      build(): any { return <any>(new XMLHttpRequest());}
    }

    let httpClient: HttpClient = new HttpClient(new HttpXhrBackend(new BrowserXhr()));
    let ontologyService: OntologyService;

    beforeEach(() => {
      ontologyService = new OntologyService(httpClient);
    });

    it('should lookup', done => {
      let schema = createTestSchema();
      ontologyService.lookup(schema, '')
        .subscribe((ontologies: Ontology[]) => {
          expect(ontologies.length).toBeGreaterThan(0);
          expect(ontologies.length).toBeLessThanOrEqual(OlsRequestParamsDefaults.rows);
          done();
        }, function (error: HttpErrorResponse) {
          done.fail(`error: ${error.message}`);
        })
    });
    it('should select', done => {
      let schema = createTestSchema();
      ontologyService.select({q: '*', ontology: 'efo'})
        .subscribe((olsHttpResponse: OlsHttpResponse) => {
          expect(olsHttpResponse.responseHeader.status).toBe(0);
          expect(olsHttpResponse.response.numFound).toBeGreaterThan(0);
          done();
        }, function (error: HttpErrorResponse) {
          done.fail(`error: ${error.message}`);
        })
    });
  });

  describe('OntologyService using TestBed', () => {
    let service: OntologyService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          OntologyService
        ]
      });
      service = TestBed.inject(OntologyService);
      httpMock = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
      httpMock.verify();
    });
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
    it('be able to retrieve data from the API via GET', () => {
      const olsResponse: OlsResponse = creatOlsResponse();
      const olsHttpResponse = createOlsHttpResponse(olsResponse);
      olsHttpResponse.response.numFound = 3;
      service.select({}).subscribe(data => {
        expect(data).toEqual(olsHttpResponse);
      });
      const request = httpMock.expectOne(`${service.API_URL}/api/select`);
      expect(request.request.method).toBe('GET');
      expect(request.request.params).toEqual(new HttpParams({fromObject: {}}));
      request.flush(olsHttpResponse);
    });
  });


});
