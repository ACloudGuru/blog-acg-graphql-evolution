#!/bin/sh

cd ./01-gateway-invoke;
./performance.sh;
cd -;

cd ./02-schema-stitching;
./performance.sh;
cd -;