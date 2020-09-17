#!/usr/bin/env bash

BRANCH=`git rev-parse --abbrev-ref HEAD`

if [ "$BRANCH" == "master" ]; then
    echo "Sync with bitbucket"
    git pull origin master

    echo "Checking working copy clean"
    if [[ $(git diff --stat) != '' ]]; then
      echo 'dirty'
      exit 1
    else
      echo 'clean'
    fi


    echo "Running pre-push hook"
    make deploy

    # $? stores exit value of the last command
    if [ $? -ne 0 ]; then
       echo "All files must be synced with S3 before pushing!"
       exit 1
    fi
else
    echo "No triggers executed for this branch"
fi