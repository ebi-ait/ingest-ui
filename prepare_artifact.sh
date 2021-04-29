#!/bin/sh
# Prepare the build for deployment to production

# Use sensible defaults if env variables not set
INGEST_API_URL=${INGEST_API_URL:-"http://localhost:8080"}
BROKER_API_URL=${BROKER_API_URL:-"http://localhost:5000"}
SCHEMA_API_URL=${SCHEMA_API_URL:-"https://schema.humancellatlas.org"}
DSS_API_URL=${DSS_API_URL:-"https://dss.dev.data.humancellatlas.org"}
DOMAIN_WHITELIST=${DOMAIN_WHITELIST:-"localhost:8080,localhost:5000"}
AAI_CLIENT_ID=${AAI_CLIENT_ID:-"e2041c2d-9449-4468-856e-e84711cebd21"}
AAI_AUTHORITY=${AAI_AUTHORITY:-"https://login.elixir-czech.org/oidc"}
OLS_URL=${OLS_URL:-"https://ontology.dev.archive.data.humancellatlas.org"}
AUTOSAVE_PERIOD_MILLIS=${AUTOSAVE_PERIOD_MILLIS:- 10 * 1000}


# Replace template with values in main bundle files
sed -i "s#<%= INGEST_API_URL %>#$INGEST_API_URL#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= BROKER_API_URL %>#$BROKER_API_URL#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= SCHEMA_API_URL %>#$SCHEMA_API_URL#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= DSS_API_URL %>#$DSS_API_URL#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= DOMAIN_WHITELIST %>#$DOMAIN_WHITELIST#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= SECURED_ENDPOINTS %>#$SECURED_ENDPOINTS#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= AAI_CLIENT_ID %>#$AAI_CLIENT_ID#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= AAI_AUTHORITY %>#$AAI_AUTHORITY#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= OLS_URL %>#$OLS_URL#g" /usr/share/nginx/html/main-*.js
sed -i "s#<%= AUTOSAVE_PERIOD_MILLIS %>#AUTOSAVE_PERIOD_MILLIS#g" /usr/share/nginx/html/main-*.js
