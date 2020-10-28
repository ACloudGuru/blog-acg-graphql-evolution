#!/bin/bash
set -euo pipefail

echo "Offline Gateway"
(cd gateway && yarn && yarn sls --stage dev offline --httpPort 3000) &

echo "Offline Series"
(cd series && yarn && yarn sls --stage dev offline --httpPort 3001) &

echo "Offline Content"
(cd content &&  yarn && yarn sls --stage dev offline --httpPort 3003) &

wait %1 %2 %3

echo "Done"