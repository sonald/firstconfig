#
# Copyright (C) 2012  Red Flag Linux Co. Ltd
#
# Author(s):  Sian Cao <sycao@redflag-linux.com>
#

MODE_REGULAR  = 1
MODE_RECONFIG = 2

RESULT_FAILURE = 0
RESULT_SUCCESS = 1
RESULT_JUMP = 2

BASEDIR = "/usr/share/firstconfig/"


I18N = '/etc/locale.conf'
DISPLAY = ':9'
VT = 'vt1'

WMS = ('mutter',
       'metacity',
       'kwin',
       'xfwm4',
       'openbox')

XRES = '/etc/X11/Xresources'
