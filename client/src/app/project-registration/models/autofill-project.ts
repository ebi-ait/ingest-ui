export interface AutofillProject {
  title: string;
  description: string;
  doi: string;
  pmid: number;
  authors: string[];
  url: string;
  funders: Funder[];
  contributors: Contributor[];
}

export interface Funder {
  grant_id: string;
  organization: string;
}

export interface Contributor {
  name: string;
  institution: string;
  orcid_id: string;
}
