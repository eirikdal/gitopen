#!/bin/sh
#
# name as post-commit in a .git/hooks directory
#
# An example hook script that is called after a successful
# commit is made.
#
# To enable this hook, rename this file to "post-commit".

read oldrev newrev refname

IFS=$'\n'

commits=$(echo -e | git log $oldrev..$newrev --pretty=format:"%H")

for commit in $commits
do
    gitshow=$(echo -e | git show $commit)

    gitout=$(echo "$gitshow" | tr \' '\u2028')
    gitout=$(echo "$gitout" | tr '"' '\u2028')
    gitout=$(echo "$gitout" | tr '\r' '\u2028')
    gitout=$(echo "$gitout" | tr '\t' '\u2028')
    gitout=$(echo "$gitout" | tr '\v' '\u2028')
    gitout=$(echo "$gitout" | tr '\f' '\u2028')
    gitout=$(echo "$gitout" | tr '\b' '\u2028')
    gitout=$(echo "$gitout" | tr '\\' ' ')

    lines="["

    for item in $gitout
    do
        lines=$lines'"'$item'",'
    done
    lines=${lines%?}
    json='{"diff":'$lines']}'
    echo "$json" > parsed.diff

    curl -silent -H "Content-Type: application/json" -X POST -d @parsed.diff http://localhost:3000/api/commit
done