#!/bin/bash

# syntax:
# extract-po.sh

# client.po 
# js
localedir=messages/
xgettext -L Python --output-dir=$localedir --from-code=utf-8 --output=client.pot \
 livecd.html firstboot.html

xgettext -j -L Perl --output-dir=$localedir --from-code=utf-8 --output=client.pot \
 js/fcutil.js  js/livecd.js js/firstboot.js


