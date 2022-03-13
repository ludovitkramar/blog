#!/bin/bash

for f in ./*.md; do
   newNmae=${f//-/_} #replace all - with _
   mv $f $newNmae
done
