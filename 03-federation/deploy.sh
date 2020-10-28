#!/bin/bash
set -euo pipefail

# TODO: Automatically fetch from serverless framework output
export SERIES_URL='https://yi3yqefld5.execute-api.us-east-1.amazonaws.com/dev/graphql'
export CONTENT_URL='https://lxjy04ydvi.execute-api.us-east-1.amazonaws.com/dev/graphql'
export IDENTITY_URL='https://ep5np59jpg.execute-api.us-east-1.amazonaws.com/dev/graphql'

echo "Deploying Gateway"
(cd gateway &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Series"
(cd series &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Content"
(cd content &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Identity"
(cd identity &&  yarn &&  yarn sls --stage dev deploy) &

wait %1 %2 %3

echo "Done"