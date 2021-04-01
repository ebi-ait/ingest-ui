export interface AutofillProject {
  title: string;
  description: string;
  doi: string;
  pmid: number;
  authors: string[];
  url: string;
  funders: Funder[];
}

export interface Funder {
  'grant_id': string;
  'organization': string;
}
