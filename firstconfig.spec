%{!?python_sitelib: %define python_sitelib %(%{__python} -c "from distutils.sysconfig import get_python_lib; print get_python_lib(1)")}

Summary: Initial system configuration utility
Name: firstconfig
URL: http://www.redflag-linux.com
Version: 0.1.0
Release: 1%{?dist}
Source0: %{name}-%{version}.tar.bz2

License: GPLv2+
Group: System Environment/Base
ExclusiveOS: Linux
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildRequires: gettext
BuildRequires: python-devel, python-setuptools-devel
Requires: pygtk2, python
Requires: firstboot(windowmanager)

%description
The firstboot utility runs after installation.  It guides the user through
a series of steps that allows for easier configuration of the machine.

%prep
%setup -q

%build

%install
rm -rf %{buildroot}
make DESTDIR=%{buildroot} SITELIB=%{python_sitelib} install

%clean
rm -rf %{buildroot}

%post
if [ $1 -ne 2 -a ! -f /etc/sysconfig/firstboot ]; then
    systemctl enable firstconfig.service >/dev/null 2>&1 || :
fi
if [ ! -d /etc/sysconfig ]; then
    mkdir -p /etc/sysconfig
fi

%preun
/bin/systemctl stop firstconfig.service > /dev/null 2>&1 || :

%files
%defattr(-,root,root,-)
%{python_sitelib}/*
%{_sbindir}/rffirstconfig
/lib/systemd/system/firstconfig.service

%changelog
* Tue Aug 28 2012 Sian Cao<sycao@redflag-linux.com> 0.1.0-1
- first build

