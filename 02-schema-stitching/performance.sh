# Force coldstarts
./deploy.sh

# Run tests
ab \
    -n 1000 \
    -c 5 \
    -T "application/json" \
    -p "post-request.json" \
    -g "gateway-stitch.tsv" \
    "https://r2kyiegeq5.execute-api.us-east-1.amazonaws.com/dev/graphql"