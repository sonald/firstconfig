#
# frontend.py
#
# Copyright (C) 2012  Red Flag Linux Co. Ltd
#
# Author(s):  Sian Cao <sycao@redflag-linux.com>
#

import logging
import os
import shlex
import signal
import subprocess

# set up logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger('firstconfig.frontend')

from .constants import *


class Frontend:
    def __init__(self):
        self.x = None
        self.wm_pid = None

    def set_lang(self):
        if os.getenv('LANG') == None:
            i18n = shlex.split(open(I18N).read())
            i18n = dict(item.split('=') for item in i18n)
            if 'LANG' in i18n:
                log.info('setting LANG to %s', i18n['LANG'])
                os.environ['LANG'] = i18n['LANG']

    def startx(self):
        def sigusr1_handler(num, frame):
            pass

        def sigchld_handler(num, frame):
            raise OSError

        def preexec_fn():
            signal.signal(signal.SIGUSR1, signal.SIG_IGN)

        old_sigusr1 = signal.signal(signal.SIGUSR1, sigusr1_handler)
        old_sigchld = signal.signal(signal.SIGCHLD, sigchld_handler)

        os.environ['DISPLAY'] = DISPLAY
        cmd = ['Xorg', os.environ['DISPLAY'],
               '-ac', '-nolisten', 'tcp', VT]

        devnull = os.open('/dev/null', os.O_RDWR)

        try:
            log.info('starting the Xorg server')
            self.x = subprocess.Popen(cmd, stdout=devnull, stderr=devnull,
                                      preexec_fn=preexec_fn)

        except OSError as e:
            err = 'Xorg server failed to start: %s' % e
            log.critical(err)
            raise RuntimeError(err)

        signal.pause()
        signal.signal(signal.SIGUSR1, old_sigusr1)
        signal.signal(signal.SIGCHLD, old_sigchld)

        log.info('Xorg server started successfully')

        # XXX no need to close devnull?

    def start_wm(self):
        path = os.environ['PATH'].split(':')
        wms = [os.path.join(p, wm) for wm in WMS for p in path]
        available = [wm for wm in wms if os.access(wm, os.X_OK)]
        if not available:
            err = 'no window manager available'
            log.critical(err)
            raise RuntimeError(err)

        wm = available[0]
        cmd = [wm, '--display', os.environ['DISPLAY']]

        self.wm_pid = os.fork()
        if not self.wm_pid:
            log.info('starting the window manager')
            os.execvp(wm, cmd)

        try:
            pid, status = os.waitpid(self.wm_pid, os.WNOHANG)
        except OSError as e:
            err = 'window manager failed to start: %s' % e
            log.critical(err)
            raise RuntimeError(err)

        log.info('window manager started successfully')

    def merge_xres(self):
        if os.access(XRES, os.R_OK):
            log.info('merging the Xresources')
            p = subprocess.Popen(['xrdb', '--merge', XRES])
            p.wait()

    def kill(self):
        if self.wm_pid:
            log.info('killing the window manager')
            os.kill(self.wm_pid, 15)

        if self.x:
            log.info('killing the Xorg server')
            os.kill(self.x.pid, 15)
            self.x.wait()
