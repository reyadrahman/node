#!/bin/bash

timestamp="$(date +%s)"

echo "$@"

export TIMESTAMP=$timestamp;
echo $TIMESTAMP;
npm run build-server -- "$@" &
npm run build-client -- "$@" &


for job in `jobs -p`
do
    echo $job
    wait $job
done

trap 'kill $(jobs -p)' EXIT
