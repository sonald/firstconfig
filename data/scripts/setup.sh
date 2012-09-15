#!/usr/bin/env bash
#
# this script is used to modify system configurations according to env variables
# passed  to it

exec &>/tmp/firstboot.log
echo "firstboot setup start"
env
if [ x$HIPPO_TESTMODE == x1 ]; then
	echo "firstboot done (test mode)"
	exit 0
fi

if [ -n "$HIPPO_LANG" ]; then
	echo "export LANG=${HIPPO_LANG}" > /etc/skel/.xprofile

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

fi

if [ -n "$HIPPO_LIVECD" ]; then
	echo "firstboot setup finished"
	exit 0
fi

if [ -n "$HIPPO_HOSTNAME" ]; then
	## hostname
	echo $HIPPO_HOSTNAME > /etc/hostname
fi

if [ -n "$HIPPO_TIMEZONE" ]; then
	## localtime
	# HIPPO_TIMEZONE=Asia/Shanghai
	ln -sf /usr/share/zoneinfo/$HIPPO_TIMEZONE /etc/localtime
	echo "${HIPPO_TIMEZONE}" > /etc/timezone
fi

if [ -n "$HIPPO_KEYBOARD" ]; then
	## keybord
	# HIPPO_KEYBOARD=en_US
	cat << EOF > /etc/vconsole.conf
KEYMAP=$HIPPO_KEYBOARD
EOF
fi

if [ -n "$HIPPO_USERNAME" ]; then
	## add user
	useradd -m -g users -G wheel,video,audio,adm  $HIPPO_USERNAME
	if [ -z "$HIPPO_PASSWD" ]; then
		passwd -d $HIPPO_USERNAME
	else
		echo -e "${HIPPO_PASSWD}\n${HIPPO_PASSWD}" | passwd $HIPPO_USERNAME
	fi
fi


# handling post install disk partitioning
if [ "$HIPPO_EXTENDED" == "free" ]; then
	echo "firstboot setup finished"
	exit 0
fi

destdisk='/dev/sda'

# check disk type
disktype=$( parted -s -m $destdisk p  |awk -F: 'NR==2 {print $6}' )
if [[ x"$disktype" != xmsdos ]]; then
	echo "DEBUG: $destdisk is not a msdos type disk"
	exit 0
fi

if [ "$HIPPO_EXTENDED" == "primary" ]; then
	prim_cnt=$( parted -s $destdisk p | grep primary | wc -l )
	if [ $prim_cnt -eq 4 ]; then
		echo "DEBUG: $destdisk has 4 primaries"
		exit 0
	fi

	begin=$( parted -s -m $destdisk unit MB p  |awk -F: 'END { sub("MB", "", $3); print $3 }' )
	parted -s -m $destdisk unit MB mkpart primary $((begin + 1)) 100%

elif [ "$HIPPO_EXTENDED" == "logical" ]; then
		# lenovo

		do_make_extended=0
		if `parted -s $destdisk p | grep -q extended`; then
			echo "DEBUG: $destdisk has extended partition already"
			exit 0
		else
			do_make_extended=1
		fi

		if [ x$do_make_extended == x1 ]; then
			begin=$( parted -s -m $destdisk unit MB p  |awk -F: 'END { sub("MB", "", $3); print $3 }' )

		    # now create it!
		    parted $destdisk unit MB mkpart extended $((begin + 1)) 100%
		    parted -s -m $destdisk unit MB mkpart logical $((begin + 2)) 100%
		fi
	fi
fi


echo "firstboot setup finished"
