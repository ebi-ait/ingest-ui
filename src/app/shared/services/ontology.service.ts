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
      q: searchText || '*',
      rows: 30,
      start: 0,
    };

    if (!schema) {
      return of(searchParams);
    }

    const properties = schema.properties;
    const graphRestriction = properties?.['ontology']?.['graph_restriction'] || {};
    const ontologyClasses: string[] = graphRestriction['classes'] || [];
    const ontologyRelation: string = graphRestriction['relations']?.[0] || 'rdfs:subClassOf'; // Default relation
    const ontologies: string[] = graphRestriction['ontologies'] || [];
    const includeSelf = graphRestriction['include_self'];
    const relationKey = this.OLS_RELATION[ontologyRelation] || 'allChildrenOf';

    if (ontologies.length > 0) {
      searchParams['ontology'] = ontologies
        .map((ontology) => ontology.replace('obo:', ''))
        .join(",");
    }

    // Logging for "Strain ontology"
    if (schema.title === 'Strain ontology') {
      console.log('--- Debug: Strain Ontology ---');
      console.log('Properties:', properties);
      console.log('Graph Restriction:', graphRestriction);
      console.log('Ontology Classes:', ontologyClasses);
      console.log('Ontology Relation:', ontologyRelation);
      console.log('Ontologies:', ontologies);
    }

    if (ontologyClasses.length === 0) {
      console.warn("No ontology classes found. Using default q parameter.");
      return of(searchParams);
    }

    return combineLatest(
      ontologyClasses.map((ontologyClass) =>
        this.http.get<{ _embedded: { terms: Array<{ iri: string }> } }>(
          `${this.API_URL}/api/terms`,
          { params: { id: ontologyClass } }
        ).pipe(
          map((response) => {
            const termIri = response._embedded?.terms?.[0]?.iri;
            if (!termIri) {
              console.warn(`No IRI found for class: ${ontologyClass}`);
            }
            return termIri || '';
          })
        )
      )
    ).pipe(
      map((iriArray) => {
        const validIris = iriArray.filter((iri) => !!iri);

        if (validIris.length > 0) {
          searchParams[relationKey] = validIris.join(',');
          if (includeSelf) {
            searchParams['includeSelf'] = true;
          }
        } else {
          searchParams.q = searchText || '*';
        }

        // Log final search parameters for "Strain ontology"
        if (schema.title === 'Strain ontology') {
          console.log('Final Search Parameters:', searchParams);
        }

        return searchParams;
      })
    );
  }


  searchOntologies(params: OlsRequestParams): Observable<Ontology[]> {
    if (params.q.includes('Strain ontology')) {
      console.log('--- Debug: Search Ontologies ---');
      console.log('Search Parameters:', params);
    }

    return this.select(params).pipe(
      map((result) => {
        if (!result.response || !result.response.docs) {
          console.error("No response or docs found in API result.");
          return [];
        }

        if (params.q.includes('Strain ontology')) {
          console.log('API Result:', result.response.docs);
        }

        return result.response.docs
          .filter((doc) => doc.type === 'class' && doc.label && doc.obo_id)
          .map((doc) => ({
            ontology: doc.obo_id,
            ontology_label: doc.label,
            text: doc.label,
          }));
      })
    );
  }

  select(params: any, schemaTitle?: string): Observable<OlsHttpResponse> {
    const queryParams = new URLSearchParams(params).toString();
    const fullUrl = `${this.API_URL}/api/select?${queryParams}`;

    // Log the URL only if the schema title is "Strain Ontology"
    if (schemaTitle === 'Strain ontology') {
      console.log('--- Debug: Strain Ontology API Request ---');
      console.log('Constructed API URL:', fullUrl);
      console.log('Request Parameters:', params);
    }

    return this.http.get<OlsHttpResponse>(fullUrl);
  }

}
