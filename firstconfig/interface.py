#
# Sian Cao <sycao@redflag-linux.com>
#
# Copyright (C) 2012  Red Flag Linux Co. Ltd
#

import logging, os, sys

from .constants import *
from .functions import *

from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import *

import json

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger('firstconfig.interface')

import gettext
_ = lambda x: gettext.ldgettext("firstconfig", x)

class ConfigHost(QObject):
    def sendScript(self, opts = {}):
        res = { 
            "status": True
        }
        #TODO: exec /etc/postinstall?
        return json.dumps(res)

    def validate(self, opts = {}):
        res = { 
            "status": True
        }
        return json.dumps(res)

    @pyqtSlot()
    def closeWindow(self):
        sys.exit(0)

    @pyqtSlot(str, str, result=str)
    def request(self, cmd="", args=""):
        cmds = {
            "send": self.sendScript,
            "validate": self.validate
        }

        print(cmd, args)
        opts = json.loads(args)
        return cmds[cmd](opts)

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
        hostobj = ConfigHost()
        self.view.page().mainFrame().addToJavaScriptWindowObject("hostobj", hostobj)

    def createSkeletonUI(self, pageHtml=""):
        self.window = QWidget()
        self.window.resize(1024,576)
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

        assetsPath = "file://" + os.path.join(basedir, "data/" + pageHtml)
        htmlPath = os.path.join(basedir, "data/" + pageHtml)
        log.debug('assetsPath: %s, htmlPath: %s', assetsPath, htmlPath)

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
        shortcut.setKey(Qt.CTRL+Qt.SHIFT+Qt.Key_I)
        shortcut.activated.connect(self.toggleInspector)
        self.webInspector.setVisible(False)

    def toggleInspector(self):
        self.webInspector.setVisible(not self.webInspector.isVisible())

    def run(self):
        self.view.show()
        self.window.show()
        self.app.exec_()
