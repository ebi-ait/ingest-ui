export const environment = {
  production: true,
  INGEST_API_URL: '<%= INGEST_API_URL %>',
  BROKER_API_URL: '<%= BROKER_API_URL %>',
  SCHEMA_API_URL: '<%= SCHEMA_API_URL %>',
  DSS_API_URL: '<%= DSS_API_URL %>',
  DOMAIN_WHITELIST: '<%= DOMAIN_WHITELIST %>',
  SECURED_ENDPOINTS: '<%= SECURED_ENDPOINTS %>',
  // AAI
  AAI_CLIENT_ID: '<%= AAI_CLIENT_ID %>',
  AAI_AUTHORITY: '<%= AAI_AUTHORITY %>',

  OLS_URL: '<%= OLS_URL %>',

  AUTOSAVE_PERIOD_MILLIS: 10 * 1000,
  WRANGLER_EMAIL: 'wrangler-team@data.humancellatlas.org',
  EUROPE_PMC_API_URL: 'https://www.ebi.ac.uk/europepmc/webservices/rest/search',
  DOI_BASE_URL: 'https://doi.org/'
};
