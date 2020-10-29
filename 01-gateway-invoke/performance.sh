# Force coldstarts
./deploy.sh

# Run tests
ab \
    -n 1000 \
    -c 5 \
    -T "application/json" \
    -p "post-request.json" \
    -g "gateway-invoke-results.tsv" \
    "https://11gx93bhx8.execute-api.us-east-1.amazonaws.com/dev/graphql"