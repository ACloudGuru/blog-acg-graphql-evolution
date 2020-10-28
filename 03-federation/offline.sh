#!/bin/bash
set -euo pipefail

export SERIES_URL='http://localhost:4000/dev/graphql'
export CONTENT_URL='http://localhost:5000/dev/graphql'
export IDENTITY_URL='http://localhost:6000/dev/graphql'

echo "Offline Gateway"
(cd gateway && yarn && yarn sls --stage dev offline --httpPort 3000) &

echo "Offline Series"
(cd series && yarn && yarn sls --stage dev offline --httpPort 4000) &

echo "Offline Content"
(cd content &&  yarn && yarn sls --stage dev offline --httpPort 5000) &

echo "Offline Identity"
(cd identity &&  yarn && yarn sls --stage dev offline --httpPort 6000) &

wait %1 %2 %3 % 4

echo "Done"