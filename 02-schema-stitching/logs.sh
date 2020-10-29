#!/bin/bash
set -euo pipefail

export SERIES_URL='https://0b6bjtlup5.execute-api.us-east-1.amazonaws.com/dev/graphql'
export CONTENT_URL='https://cp8128hr9b.execute-api.us-east-1.amazonaws.com/dev/graphql'
export IDENTITY_URL='https://ep5np59jpg.execute-api.us-east-1.amazonaws.com/dev/graphql'

echo "Logs Gateway"
(cd gateway &&  yarn && yarn sls -s dev logs -f graphql -t) &

echo "Logs Series"
(cd series &&  yarn && yarn sls -s dev logs -f graphql -t) &

echo "Logs Content"
(cd content &&  yarn && yarn sls -s dev logs -f graphql -t) &

echo "Logs Identity"
(cd identity &&  yarn && yarn sls -s dev logs -f graphql -t) &

wait %1 %2 %3 %4

echo "Done"