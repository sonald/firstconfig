#!/usr/bin/python

from distutils.core import setup
from glob import *
import os

data_files = [('/usr/sbin', ['rffirstconfig']),
              ('/lib/systemd/system', glob('systemd/*.service'))]

setup(name='firstconfig', version='0.1.0',
      description='Post-installation configuration utility',
      author='Sian Cao', author_email='sycao@redflag-linux.com',
      url='http://www.redflag-linux.com',
      data_files=data_files,
      packages=['firstconfig'])
