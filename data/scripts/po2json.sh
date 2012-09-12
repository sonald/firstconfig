#!/bin/bash
# plz run it at root of installer project

localedir=messages
for lang in `find $localedir -type f -name "*.po"`; do
    locale=`basename $lang .po`
    locale_data=$localedir/client.$locale.json
    ./scripts/po2json.js -p $localedir/$locale.po > $locale_data
done
