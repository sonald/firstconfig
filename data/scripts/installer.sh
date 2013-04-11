#!/bin/bash
set -x
&>/tmp/installer.log
export LANG=${HIPPO_LANG}
echo "reboot -f" >> /etc/postjobs
su installer -c qomoinstaller
reboot -f
