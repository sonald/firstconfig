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

    DISKTOP="NULL_DIR"
	## kde
	if [ -f /usr/share/config/kdm/kdmrc ]; then
		sed -i "s/^#Language.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /usr/share/config/kdm/kdmrc
		sed -i "s/Language=.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /etc/skel/.kde4/share/config/kdeglobals
		if [ ${HIPPO_LANG} == "zh_CN.UTF-8" ]; then
			sed -i 's/Desktop/桌面/g' /etc/skel/.config/user-dirs.dirs
			sed -i 's/Documents/文档/g' /etc/skel/.config/user-dirs.dirs
			sed -i 's/Downloads/下载/g' /etc/skel/.config/user-dirs.dirs
			sed -i 's/Media/多媒体/g' /etc/skel/.config/user-dirs.dirs
			sed -i 's/Pictures/图片/g' /etc/skel/.config/user-dirs.dirs
			mkdir -v -p /etc/skel/{桌面,文档,下载,音乐,图片,视频}
            PIC="图片"
        
            DISKTOP="桌面"
		else
			mkdir -v -p /etc/skel/{Desktop,Documents,Downloads,Music,Pictures,Videos}
            PIC="Pictures"
            DISKTOP="Desktop"
			sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/activitymanagerrc
			sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/plasma-desktop-appletsrc
		fi
            cat << _EOF >> /etc/skel/${PIC}/.directory
[Dolphin]
PreviewsShown=true
Timestamp=3000,1,1,0,0,0
_EOF

            pushd /etc/skel/${DISKTOP}/
            ln -s /usr/share/applications/firefox.desktop .
            popd
	fi

fi

if [ -n "$HIPPO_LIVECD" ]; then

    LIVECD_USER="installer"

    useradd -m -g users -G wheel,video,audio,adm,lp ${LIVECD_USER}
    passwd -d ${LIVECD_USER}
    # gdm
    test -f /etc/gdm/custom.conf && sed "s/daemon/a\AutomaticLoginEnable=True\nAutomaticLogin=${LIVECD_USER}" -i /etc/gdm/custom.conf
    ## kdmrc
    test -f /usr/share/config/kdm/kdmrc &&  sed -i -e 's/.*AutoLoginEnable.*/AutoLoginEnable=true/g'\
        -e "s/.*AutoLoginUser.*/AutoLoginUser=${LIVECD_USER}/g" \
        -e 's/.*AllowNullPasswd.*/AllowNullPasswd=true/g'  /usr/share/config/kdm/kdmrc

    ## 安装程序到桌面
    test -d /home/${LIVECD_USER}/${DISKTOP} &&  rm -f /usr/share/apps/kio_desktop/* &&  rm -fr /home/${LIVECD_USER}/${DISKTOP}/*
    test -f /home/${LIVECD_USER}/.kde4/share/config/plasma-desktop-appletsrc && \
    cat << _EOF >> /etc/skel/.kde4/share/config/plasma-desktop-appletsrc  
[Containments][8][Applets][23]  
geometry=30,30,100,100  
immutability=1  
plugin=icon  
zvalue=0  

[Containments][8][Applets][23][Configuration]  
Url=file:///usr/share/applications/qomoinstaller.desktop  
_EOF

	echo "firstboot setup finished"
	exit 0
fi

if [ -n "$HIPPO_HOSTNAME" ]; then
	## hostname
	echo $HIPPO_HOSTNAME > /etc/hostname
    hostname $HIPPO_HOSTNAME
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
	useradd -m -g users -G wheel,video,audio,adm,lp  $HIPPO_USERNAME
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

function getBeginOfLast() {
	echo $( parted -s -m $destdisk unit MB p  |awk -F: 'END { sub("MB", "", $3); print $3 }' )
}

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

	begin=$( getBeginOfLast )
	parted -s -m $destdisk unit MB mkpart primary $((begin + 1)) 100%

	[ $? -eq 0 ] && do_mkfs=mkfs.ext3

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
		begin=$( getBeginOfLast )

	    # now create it!
	    parted $destdisk unit MB mkpart extended $((begin + 1)) 100%
	    parted -s -m $destdisk unit MB mkpart logical $((begin + 2)) 100%

	    [ $? -eq 0 ] && do_mkfs=mkfs.ext4
	fi
fi

if [ -n "$do_mkfs" ]; then
	# format created partition, it MUST be the last partition
	last_part=$( parted -s -m $destdisk p | awk -F: 'END {print $1}' )
	part=${destdisk}${last_part}
	[ -b "$part" ] && $do_mkfs -q $part
fi

echo "firstboot setup finished"
exit 0
