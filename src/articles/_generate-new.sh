#!/bin/bash

before="const articles = ["

after="];\n
\n
export default articles;"

echo -e $before > ./articles.js

for f in ./*.md; do
   fname=$(echo $f | rev | cut -c 4- | rev)
   echo "\"$(echo $fname | cut -c 3-)\"," >> ./articles.js
done

echo -e $after >> ./articles.js