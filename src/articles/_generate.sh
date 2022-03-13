#!/bin/bash

for f in ./*.md; do
   fname=$(echo $f | rev | cut -c 4- | rev)
   before="import '../article.css';\n
\n
const $(echo $fname | cut -c 3-) = () => {\n
  return (\n
    <>\n"
   after="\n
    </>\n
  )\n
};\n
\n
export default $(echo $fname | cut -c 3-);\n"
   echo -e $before > $fname.js
   pandoc --ascii $f > ./tempfile.tmp
   sed -i 's:{:\&#123;:g' ./tempfile.tmp #replace all { with &#123;
   sed -i 's:}:\&#125;:g' ./tempfile.tmp #replace all } with &#123;
   #s1=${s0//{/&#123;} #replace all { with &#123;
   #s2=${s1//\}/&#125;} #replace all } with &#123;
   cat ./tempfile.tmp >> $fname.js
   echo -e $after >> $fname.js

rm ./tempfile.tmp
done
