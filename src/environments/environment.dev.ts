export const environment = {
  production: false,
  INGEST_API_URL: 'https://api.ingest.dev.archive.data.humancellatlas.org',
  BROKER_API_URL: 'https://ingest.dev.archive.data.humancellatlas.org',
  SCHEMA_API_URL: 'https://schema.humancellatlas.org',
  DSS_API_URL: 'https://dss.dev.data.humancellatlas.org',
  DOMAIN_WHITELIST: 'api.ingest.dev.archive.data.humancellatlas.org,ingest.dev.archive.data.humancellatlas.org',
  SECURED_ENDPOINTS: '\/auth\/.*,\/user\/.*,\/submissionEnvelopes\/?.*,\/projects$',
  // AAI
  AAI_CLIENT_ID: 'e2041c2d-9449-4468-856e-e84711cebd21',
  AAI_AUTHORITY: 'https://login.elixir-czech.org/oidc',

  OLS_URL: 'https://ontology.dev.archive.data.humancellatlas.org',

  AUTOSAVE_PERIOD_MILLIS: 10 * 1000,
  WRANGLER_EMAIL: 'wrangler-team@data.humancellatlas.org',
  EUROPE_PMC_API_URL: 'https://www.ebi.ac.uk/europepmc/webservices/rest/search',
  DOI_BASE_URL: 'https://doi.org/'
};
