# I want for understand more about

Core: 

- [x] Lambda and XRay, lambda cold starts (best case: Startup 100ms + Initialisation 150ms, common case: Startup: 300ms + Intialisation of 600ms)
- [ ] Bff & downstream lambda functions through invoke
- [ ] GraphQL Federation

Extra:
- [ ] Cloudwatch logs & metrics (automated dashboards)


Automation:
- AWS Account ID outside of environment


Problem:
- Reducing cold starts & lead time

# Story 1:
## 01-gateway-invoke     Gateway lambda invoke

Rational:
    - Gateway for GraphQL, business logic in services

Problems:
    - Schema exists on gateway (increased lead time)
    - 4 serial cold starts
    - Coupled to lambda

##  02-schema-stitching   Schema stitching (w/ GraphQL call) - Reduction in lambdas used

Rational:
    - Services should own their own schema
    - Services handle their own part of the graph

New Problem:
    - Monitoring

Problems:
    - Coupling between series & content (series' owns content schema)

##  03-federation         Apollo Federation for Cross Domain (loose coupling)

Rational:
    - All Services should own their own schema