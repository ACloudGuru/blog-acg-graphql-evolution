#!/bin/bash
set -euo pipefail

echo "Deploying Gateway"
(cd gateway &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Series"
(cd series &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Content"
(cd content &&  yarn &&  yarn sls --stage dev deploy) &

echo "Deploying Identity"
(cd identity &&  yarn &&  yarn sls --stage dev deploy) &

wait %1 %2 %3 %4

echo "Done"