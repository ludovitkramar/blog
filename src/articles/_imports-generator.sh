#!/bin/bash

for f in ./*.md; do
   fname=$(echo $f | rev | cut -c 4- | rev)
   echo "import $(echo $fname | cut -c 3-) from \"./articles/$(echo $fname | cut -c 3-).js\";"
done

echo [
for f in ./*.md; do
   fname=$(echo $f | rev | cut -c 4- | rev)
   echo "\"$(echo $fname | cut -c 3-)\","
done
echo ]
