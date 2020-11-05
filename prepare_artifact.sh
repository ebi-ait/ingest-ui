#!/bin/sh
# Prepare the build for deployment to production

if [ -n "$INGEST_API_URL" ]; then
    sed -i "s#<%= INGEST_API_URL %>#$INGEST_API_URL#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$BROKER_API_URL" ]; then
    sed -i "s#<%= BROKER_API_URL %>#$BROKER_API_URL#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$SCHEMA_API_URL" ]; then
    sed -i "s#<%= SCHEMA_API_URL %>#$SCHEMA_API_URL#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$DSS_API_URL" ]; then
    sed -i "s#<%= DSS_API_URL %>#$DSS_API_URL#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$DOMAIN_WHITELIST" ]; then
    sed -i "s#<%= DOMAIN_WHITELIST %>#$DOMAIN_WHITELIST#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$AAI_CLIENT_ID" ]; then
    sed -i "s#<%= AAI_CLIENT_ID %>#$AAI_CLIENT_ID#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$AAI_AUTHORITY" ]; then
    sed -i "s#<%= AAI_AUTHORITY %>#$AAI_AUTHORITY#g" /usr/share/nginx/html/main-*.js
fi

if [ -n "$OLS_URL" ]; then
    sed -i "s#<%= OLS_URL %>#$OLS_URL#g" /usr/share/nginx/html/main-*.js
fi