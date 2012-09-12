#!/bin/bash

# syntax:
# compile-mo.sh locale-dir/

localedir=messages

for lang in `find $localedir -type f -name "*.po"`; do
    dir=`dirname $lang`
    stem=`basename $lang .po`
    msgmerge -o ${dir}/${stem}.po.tmp ${dir}/${stem}.po ${dir}/client.pot
    mv ${dir}/${stem}.po.tmp ${dir}/${stem}.po
done

