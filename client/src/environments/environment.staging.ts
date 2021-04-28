export const environment = {
  production: false,
  INGEST_API_URL: 'https://api.ingest.staging.archive.data.humancellatlas.org',
  BROKER_API_URL: 'https://ingest.staging.archive.data.humancellatlas.org',
  SCHEMA_API_URL: 'https://schema.humancellatlas.org',
  DSS_API_URL: 'https://dss.staging.data.humancellatlas.org',
  DOMAIN_WHITELIST: 'api.ingest.staging.archive.data.humancellatlas.org,ingest.staging.archive.data.humancellatlas.org',
  SECURED_ENDPOINTS: '\/auth\/.*,\/user\/.*,\/submissionEnvelopes$,\/projects$',
  // AAI
  AAI_CLIENT_ID: 'e2041c2d-9449-4468-856e-e84711cebd21',
  AAI_AUTHORITY: 'https://login.elixir-czech.org/oidc',

  OLS_URL: 'https://ontology.staging.archive.data.humancellatlas.org',

  AUTOSAVE_PERIOD_MILLIS: 10 * 1000
};
