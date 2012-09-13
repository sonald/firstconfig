#
# Copyright (C) 2012  Red Flag Linux Co. Ltd
#
# Author(s):  Sian Cao <sycao@redflag-linux.com>
#

MODE_REGULAR = 1
MODE_RECONFIG = 2

RESULT_FAILURE = 0
RESULT_SUCCESS = 1
RESULT_JUMP = 2

# this used to build ui components and determine what actually needs to be done
# in the script.
RF_CONF = "/etc/hippo.conf"

BASEDIR = "/usr/share/firstconfig/"

# this path stores licenses files
OEM_LICENSES_PATH = '/usr/share/licenses/oem/'

# I cannot depend on this I18N file for locale setting, cause in Qomo KDE's
# language def may deviate from this setting
I18N = '/etc/locale.conf'
DISPLAY = ':9'
# tricky: I don't know why, but vt1 may cause problem
VT = 'vt2'

WMS = ('mutter',
       'metacity',
       'kwin',
       'xfwm4',
       'openbox')

XRES = '/etc/X11/Xresources'
