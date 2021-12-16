#!/usr/bin/env bash

DB_NAME="$1"
COS_NAME="$2"
APPID_NAME="$3"

if [[ -z "${DB_NAME}" ]] || [[ -z "${COS_NAME}" ]] || [[ -z "${APPID_NAME}" ]]; then
  echo "Usage: source ./scripts/setup-environment.sh MONGO_NAME COS_NAME APPID_NAME"
  echo "  where:"
  echo "    MONGO_NAME is the name of the MongoDB service instance in the cloud environment"
  echo "    COS_NAME is the name of the Object Storage service instance in the cloud environment"
  echo "    APPID_NAME is the name of the AppID service instance in the cloud environment"
  exit 1
fi

# Setup Mongo
DB_ID=$(ibmcloud resource service-instance "${DB_NAME}" --output JSON | jq -r '.[] | .id')
export NODE_ENV="dev"
export DATABASE_DEV=$(ibmcloud resource service-keys --output JSON | jq -c --arg ID "${DB_ID}" '[.[] | select(.source_crn == $ID)][0].credentials')
# For local development: replace "ibmclouddb" with dev DB "ibmclouddb-dev"
export DATABASE_DEV=$(echo $DATABASE_DEV | sed -a "s/ibmclouddb/ibmclouddb-dev/g")
export DATABASE_TEST=$(echo $DATABASE_DEV | sed -a "s/ibmclouddb-dev/ibmcloudtestdb/g")
export DATABASE=$DATABASE_DEV

# Setup AppID Auth

APPID_ID=$(ibmcloud resource service-instance "${APPID_NAME}" --output JSON | jq -r '.[] | .id')
export APPID_OAUTH_SERVER_URL=$(ibmcloud resource service-keys --output JSON | jq -c --arg ID "${APPID_ID}" '[.[] | select(.source_crn == $ID)][0].credentials.oauthServerUrl' | sed -a 's/"//g')

# Setup COS Auth
COS_ID=$(ibmcloud resource service-instance "${COS_NAME}" --output JSON | jq -r '.[] | .id')
export STORAGE=$(ibmcloud resource service-keys --output JSON | jq -c --arg ID "${COS_ID}" '[.[] | select(.source_crn == $ID)][0].credentials')
