#!/usr/bin/env bash
#
# this script is used to modify system configurations according to env variables
# passed  to it

exec &>/var/log/firstboot.log
echo "firstboot setup start"

if [ x$HIPPO_TESTMODE == x1 ]; then
	echo "firstboot done (test mode)"
	exit 0
fi

## language
# HIPPO_LANG=zh_CN.UTF-8
echo "export LANG=${HIPPO_LANG}" > /etc/skel/.xprofile


## hostname
echo $HIPPO_HOSTNAME > /etc/hostname

## localtime
# HIPPO_TIMEZONE=Asia/Shanghai
ln -sf /usr/share/zoneinfo/$HIPPO_TIMEZONE /etc/localtime
echo "${HIPPO_TIMEZONE}" > /etc/timezone

## keybord
# HIPPO_KEYBOARD=en_US
cat << EOF > /etc/vconsole.conf
KEYMAP=$HIPPO_KEYBOARD
EOF

## kde
if [ -f /usr/share/config/kdm/kdmrc ]; then
	sed -i "s/^#Language.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /usr/share/config/kdm/kdmrc
	sed -i "s/Language=.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /etc/skel/.kde4/share/config/kdeglobals
	if [ ${HIPPO_LANG} == "zh_CN.UTF-8" ]; then
		sed -i 's/Desktop/桌面/g' /etc/skel/.config/user-dirs.dirs
		sed -i 's/Documents/文档/g' /etc/skel/.config/user-dirs.dirs
		sed -i 's/Downloads/下载/g' /etc/skel/.config/user-dirs.dirs
		sed -i 's/Music/音乐/g' /etc/skel/.config/user-dirs.dirs
		sed -i 's/Pictures/图片/g' /etc/skel/.config/user-dirs.dirs
		sed -i 's/Videos/视频/g' /etc/skel/.config/user-dirs.dirs
		mkdir -v -p /etc/skel/{桌面,文档,下载,音乐,图片,视频}
	else
		mkdir -v -p /etc/skel/{Desktop,Documents,Downloads,Music,Pictures,Videos}
		sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/activitymanagerrc
		sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/plasma-desktop-appletsrc
	fi
fi

## add user
useradd -m -g users -G wheel,video,audio,adm  $HIPPO_USERNAME
echo -e "${HIPPO_PASSWD}\n${HIPPO_PASSWD}" | passwd $HIPPO_USERNAME

echo "firstboot setup finished"