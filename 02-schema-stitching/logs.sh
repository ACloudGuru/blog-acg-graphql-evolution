#!/bin/bash
set -euo pipefail

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