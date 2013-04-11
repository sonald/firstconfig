#!/bin/bash
set -x
&>/tmp/installer.log
export LANG=${HIPPO_LANG}
echo "reboot -f" >> /etc/postjobs
su installer -c 'touch ~/.Xauthority' && su installer -c qomoinstaller
