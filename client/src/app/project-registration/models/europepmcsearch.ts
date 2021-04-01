export interface EuropePMCHttpSearchResponse {
  resultList: EuropePMCResultList;
}

export interface EuropePMCResultList {
  result: EuropePMCResult[];
}

export interface EuropePMCResult {
  title: string;
  abstractText: string;
  doi: string;
  pmid: string;
  authorString: string;
  grantsList: EuropePMCGrantsList;
  authorList: EuropePMCAuthorList;
}

export interface EuropePMCGrantsList {
  grant: EuropePMCGrant[];
}

export interface EuropePMCGrant {
  grantId: string;
  agency: string;
}

export interface EuropePMCAuthorList {
  author: EuropePMCAuthor[];
}

export interface EuropePMCAuthor {
  firstName: string;
  lastName: string;
  authorAffiliationDetailsList: EuropePMCAuthorAffiliationDetailsList;
  authorId: EuropePMCAuthorId;
  // add stuff about orcid here
}

export interface EuropePMCAuthorAffiliationDetailsList {
  authorAffiliation: EuropePMCAuthorAffiliation[];
}

export interface EuropePMCAuthorAffiliation {
  affiliation: string;
}

export interface EuropePMCAuthorId {
  type: string;
  value: string;
}

// add more values later as we expand to query via pmid
export enum Identifier {
  DOI = 'doi',
}
