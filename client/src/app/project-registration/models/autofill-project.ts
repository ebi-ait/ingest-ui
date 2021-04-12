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
  first_name: string;
  last_name: string;
  institution: string;
  orcid_id: string;
}
