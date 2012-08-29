#!/usr/bin/python

from distutils.core import setup
from glob import *
import os

data_files = [('/usr/sbin', ['rffirstconfig']),
        ('/usr/share/firstconfig/data/', glob('data/*.html')),
        ('/usr/share/firstconfig/data/css', glob('data/css/*.css')),
        ('/usr/share/firstconfig/data/js', glob('data/js/*.js')),
        ('/lib/systemd/system', glob('systemd/*.service'))]

setup(name='firstconfig', version='0.1.0',
        description='Post-installation configuration utility',
        author='Sian Cao', author_email='sycao@redflag-linux.com',
        url='http://www.redflag-linux.com',
        data_files=data_files,
        packages=['firstconfig'])
