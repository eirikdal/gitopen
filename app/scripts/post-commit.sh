
#!/bin/sh
#
# name as post-commit in a .git/hooks directory
#
# An example hook script that is called after a successful
# commit is made.
#
# To enable this hook, rename this file to "post-commit".

IFS="\n"

gitshow = $(echo -e | git show)

gitout=$(git show | tr \" \')

lines="["

for item in $gitout
do
    lines=$lines'"'$item'",'
    echo "$item"
done
lines=${lines%?}
json='{"diff":'$lines']}'
echo "$json" > parsed.diff

curl -v -H "Content-Type: application/json" -X POST -d @parsed.diff http://localhost:3000/api/gitshow
