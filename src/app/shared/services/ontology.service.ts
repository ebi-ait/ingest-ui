import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {JsonSchema} from '../../metadata-schema-form/models/json-schema';
import {OlsHttpResponse, OlsRequestParams, OlsRequestParamsDefaults} from '../models/ols';
import {Ontology} from '../models/ontology';


@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  API_URL: string = environment.OLS_URL;

  OLS_RELATION: object = {
    'rdfs:subClassOf': 'allChildrenOf'
  };

  constructor(private http: HttpClient) {
    console.log('ols url', this.API_URL);
  }

  lookup(schema: JsonSchema, searchText: string): Observable<Ontology[]> {
    return this
      .createSearchParams(schema, searchText)
      .pipe(
        distinctUntilChanged(),
        switchMap(params => {
          return this.searchOntologies(params);
        })
      );
  }

  createSearchParams(schema: JsonSchema, searchText?: string): Observable<OlsRequestParams> {
    const searchParams: OlsRequestParams = {
      ...OlsRequestParamsDefaults,
      q: searchText || '*',
      rows: 30,
      start: 0,
      groupField: 'iri',
    };

    if (!schema) {
      return of(searchParams);
    }

    const properties = schema.properties;
    const graphRestriction = properties?.['ontology']?.['graph_restriction'] || {};
    const ontologyClasses: string[] = graphRestriction['classes'] || [];
    const ontologyRelation: string = graphRestriction['relations']?.[0] || ''; // TODO support only 1 relation for now
    const ontologies: string[] = graphRestriction['ontologies'] || [];

    if (ontologies.length > 0) {
      searchParams['ontology'] = ontologies
        .map((ontology) => ontology.replace('obo:', ''))
        .join(",");
    }

    if (ontologyClasses.length === 0) {
      console.warn("No ontology classes found. Using default q parameter.");
      return of(searchParams);
    }

    return combineLatest(
      ontologyClasses
        .map((ontologyClass) => ontologyClass.replace(':', '_'))
        .map((olsClass) =>
          this.select({
            q: olsClass,
            ontology: searchParams['ontology'],
          })
        )
    ).pipe(
      map((responseArray) => {
        const iriArray = responseArray
          .map((ols) => ols.response)
          .filter((olsResponse) => olsResponse.numFound === 1)
          .map((olsResponse) => olsResponse.docs[0]?.iri || '');

        if (iriArray.length > 0) {
          if (ontologyRelation && this.OLS_RELATION[ontologyRelation]) {
            searchParams[this.OLS_RELATION[ontologyRelation]] = iriArray.join(',');
          } else {
            searchParams['allChildrenOf'] = iriArray.join(',');
          }
        } else {
          searchParams.q = searchText || '*';
        }

        return searchParams;
      })
    );
  }


  searchOntologies(params:OlsRequestParams): Observable<Ontology[]> {
    return this.select(params).pipe(
      map((result) => {
        const docs = result.response.docs;
        // Filter out entries without label/obo_id or of type "ontology"
        return docs
          .filter((doc) => doc.type === 'class' && doc.label && doc.obo_id)
          .map((doc) => ({
            ontology: doc.obo_id,
            ontology_label: doc.label,
            text: doc.label,
          }));
      })
    );
  }

  select(params): Observable<OlsHttpResponse> {
    return this.http
      .get<OlsHttpResponse>(`${this.API_URL}/api/select`, {params})
  }

}
