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

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger('firstconfig.interface')

import gettext
_ = lambda x: gettext.ldgettext("firstconfig", x)

class ConfigHost(QObject):
    @pyqtSlot()
    def closeWindow(self):
        sys.exit(0)

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
        self.window.setWindowTitle("Qomo Installer")

        layout = QVBoxLayout(self.window)
        layout.setMargin(0)
        layout.addWidget(splitter)

        splitter.addWidget(view)
        splitter.addWidget(self.webInspector)

        #view.page().mainFrame().addToJavaScriptWindowObject("firstconfig", ConfigHost)
        log.debug('goes here')

        if self.testMode:
            basedir = os.path.abspath(os.path.curdir)
        else:
            basedir = os.path.abspath(BASEDIR)

        assetsPath = "file://" + os.path.join(basedir, "data/" + pageHtml)
        htmlPath = os.path.join(basedir, "data/" + pageHtml)
        log.debug('assetsPath: %s, htmlPath: %s', assetsPath, htmlPath)

        with open(htmlPath, "r") as f:
            data = f.read()
            view.page().mainFrame().setHtml(data, QUrl(assetsPath))

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
