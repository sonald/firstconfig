#
# Sian Cao <sycao@redflag-linux.com>
#
# Copyright (C) 2012  Red Flag Linux Co. Ltd
#

import os
import sys
import subprocess
import logging
import json

from .constants import *
from .functions import *

from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import *


logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger('firstconfig.interface')

import gettext
_ = lambda x: gettext.ldgettext("firstconfig", x)


class ConfigHost(QObject):
    def __init__(self, intf):
        super(QObject, self).__init__()
        self.interface = intf

    def sendScript(self, opts={}):
        res = {
            "status": True
        }

        log.debug(opts)

        env = os.environ
        env['HIPPO_LANG'] = opts['lang']
        if not self.interface.livecdMode:
            env['HIPPO_USERNAME'] = opts['username']
            env['HIPPO_HOSTNAME'] = opts['hostname']
            env['HIPPO_PASSWD'] = opts['passwd']
            env['HIPPO_TIMEZONE'] = opts['timezone']
            env['HIPPO_KEYBOARD'] = opts['keyboard']

        # tell script how to fake running during test
        if self.interface.testMode:
            env['HIPPO_TESTMODE'] = '1'

        try:
            subp = subprocess.Popen("/usr/share/firstconfig/data/scripts/setup.sh",
                shell=True, env=env)
            ret = subp.wait()
        except Exception as e:
            log.debug(e)
            ret = 1

        if ret != 0:
            res["status"] = False

        log.debug('sendScript done')
        return res

    def validate(self, opts={}):
        return {
            "status": True
        }

    def getSystemLang(self, opts={}):
        return {
            "LANG": os.getenv('LANG')
        }

    #TODO: implement it!
    def getOEMLicense(self, opts={}):
        return {
            "license": ""
        }

    #TODO: implement it!
    def isOemMode(self, opts={}):
        # check ISO flag

        return {
        "status": os.path.exists(OEM_LICENSES_PATH)
        }

    @pyqtSlot()
    def closeWindow(self):
        self.interface.stop()

    @pyqtSlot(str, str, result=str)
    def request(self, cmd="", args=""):
        cmds = {
            "send": self.sendScript,
            "validate": self.validate,
            "systemLang": self.getSystemLang,
            "oemLicense": self.getOEMLicense,
            "oemMode": self.isOemMode
        }

        print(cmd, args)
        opts = json.loads(args)
        try:
            res = cmds[cmd](opts)
        except Exception as e:
            res = {'status': False}
            print(e)

        return json.dumps(res)


class Interface:
    def __init__(self, livecdMode, testing=False):
        self.app = QApplication(sys.argv)
        self.livecdMode = livecdMode
        self.testMode = testing
        log.debug('Interface livecdMode %s, testing %s', livecdMode, testing)

    def createGUI(self):
        if self.livecdMode:
            self.greeter = self.createLiveCDUI()
        else:
            self.greeter = self.createFirstbootUI()

    def setupHostObjects(self):
        log.debug('bound setupHostObjects')
        hostobj = ConfigHost(self)
        self.view.page().mainFrame().addToJavaScriptWindowObject("hostobj", hostobj)

    def createSkeletonUI(self, pageHtml=""):
        self.window = QWidget()
        self.window.resize(1024, 576)
        if not self.testMode:
            self.window.setWindowFlags(Qt.FramelessWindowHint)

        self.view = QWebView(self.window)
        view = self.view
        view.page().settings().setAttribute(QWebSettings.JavascriptCanCloseWindows, True)

        self.setupInspector()

        splitter = QSplitter(self.window)
        splitter.setOrientation(Qt.Vertical)
        self.window.setWindowTitle("Fisrt Config")

        layout = QVBoxLayout(self.window)
        layout.setMargin(0)
        layout.addWidget(splitter)

        splitter.addWidget(view)
        splitter.addWidget(self.webInspector)

        frame = view.page().mainFrame()
        frame.javaScriptWindowObjectCleared.connect(self.setupHostObjects)

        if self.testMode:
            basedir = os.path.abspath(os.path.curdir)
        else:
            basedir = os.path.abspath(BASEDIR)

        htmlPath = os.path.join(basedir, "data/" + pageHtml)
        assetsPath = "file://" + htmlPath
        log.debug('assetsPath: %s, htmlPath: %s', assetsPath, htmlPath)

        oem_path = os.path.join(basedir, "data/oem")
        if os.path.exists(OEM_LICENSES_PATH):
            if os.path.exists(oem_path):
                os.unlink(oem_path)

            os.symlink(OEM_LICENSES_PATH, oem_path)

        with open(htmlPath, "r") as f:
            data = f.read()
            frame.setHtml(data, QUrl(assetsPath))

    def createFirstbootUI(self):
        log.debug("createFirstbootUI")
        self.createSkeletonUI("firstboot.html")

    def createLiveCDUI(self):
        log.debug('createLiveCDUI')
        self.createSkeletonUI("livecd.html")

    def setupInspector(self):
        page = self.view.page()
        page.settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
        self.webInspector = QWebInspector(self.window)
        self.webInspector.setPage(page)
        page.action(page.InspectElement).setVisible(False)

        shortcut = QShortcut(self.window)
        shortcut.setKey(Qt.CTRL + Qt.SHIFT + Qt.Key_I)
        shortcut.activated.connect(self.toggleInspector)
        self.webInspector.setVisible(False)

    def toggleInspector(self):
        self.webInspector.setVisible(not self.webInspector.isVisible())

    def run(self):
        self.view.showMaximized()
        self.window.showMaximized()
        self.app.exec_()

    def stop(self):
        self.window.close()