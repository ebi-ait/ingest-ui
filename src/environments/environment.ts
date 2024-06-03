// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  INGEST_API_URL: 'http://localhost:8080',
  BROKER_API_URL: 'https://ingest.dev.archive.data.humancellatlas.org',
  SCHEMA_API_URL: 'https://schema.humancellatlas.org',
  DSS_API_URL: 'https://dss.dev.data.humancellatlas.org',
  DOMAIN_WHITELIST: 'localhost:8080,localhost:5000',
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
