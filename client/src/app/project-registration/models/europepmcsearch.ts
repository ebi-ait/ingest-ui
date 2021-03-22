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
}

// add more values later as we expand to query via pmid
export enum Identifier {
  DOI = 'doi',
}
