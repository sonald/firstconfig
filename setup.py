#!/usr/bin/python

from distutils.core import setup
from glob import *


data_files = [('/usr/sbin', ['rffirstconfig']),
        ('/usr/share/firstconfig/data/', glob('data/*.html')),
        ('/usr/share/firstconfig/data/css', glob('data/css/*.*')),
        ('/usr/share/firstconfig/data/js', glob('data/js/*.js')),
        ('/usr/share/firstconfig/data/img', glob('data/js/*.png')),
        ('/usr/share/firstconfig/data/messages', glob('data/messages/*.*')),
        ('/usr/share/firstconfig/data/licenses', glob('data/licenses/*.html')),
        ('/usr/share/firstconfig/data/scripts', glob('data/scripts/*.*'))]

setup(name='firstconfig', version='0.1.0',
        description='Post-installation configuration utility',
        author='Sian Cao', author_email='sycao@redflag-linux.com',
        url='http://www.redflag-linux.com',
        data_files=data_files,
        packages=['firstconfig'])
