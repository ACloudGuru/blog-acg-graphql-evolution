#!/bin/bash
set -euo pipefail

echo "Offline Gateway"
(cd gateway &&  yarn &&  yarn sls --stage dev offline --httpPort 3000) &

echo "Offline Series"
(cd series &&  yarn &&  yarn sls --stage dev offline --httpPort 4000) &

echo "Offline Content"
(cd content &&  yarn &&  yarn sls --stage dev offline --httpPort 5000) &

echo "Offline Identity"
(cd identity &&  yarn &&  yarn sls --stage dev offline --httpPort 6000) &

wait %1 %2 %3 %4

echo "Done"