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

hwclock -s
if [ -n "$HIPPO_LANG" ]; then

    cat << _EOF > /etc/skel/.xprofile
export LANG=${HIPPO_LANG}
export XIM=fcitx
export XIM_PROGRAM=/usr/bin/fcitx
export GTK_IM_MODULE=xim
export QT_IM_MODULE=xim
export XMODIFIERS="@im=fcitx"
if [ -x .config/user-first-run.sh ]; then
    .config/user-first-run.sh
fi
_EOF

    DESKTOP="Desktop"
    ## kde
    if [ -f /usr/share/xsessions/kde-plasma.desktop ]; then
        sed -i "s/.*Language=.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /usr/share/config/kdm/kdmrc
        sed -i "s/.*Language=.*/Language=`echo ${HIPPO_LANG}| cut -d . -f 1`/g" /etc/skel/.kde4/share/config/kdeglobals
        if [ ${HIPPO_LANG} == "zh_CN.UTF-8" ]; then
            sed -i 's/Desktop/桌面/g' /etc/skel/.config/user-dirs.dirs
            sed -i 's/Documents/文档/g' /etc/skel/.config/user-dirs.dirs
            sed -i 's/Downloads/下载/g' /etc/skel/.config/user-dirs.dirs
            sed -i 's/Music/音乐/g' /etc/skel/.config/user-dirs.dirs
            sed -i 's/Pictures/图片/g' /etc/skel/.config/user-dirs.dirs
            sed -i 's/Videos/视频/g' /etc/skel/.config/user-dirs.dirs 
            mkdir -v -p /etc/skel/{桌面,文档,下载,音乐,图片,视频}
            PIC="图片"

			DESKTOP="桌面"

			## ati kmix config cn 
			lspci |grep VGA|grep -q ATI && cp -af /usr/share/ati-kmix/cn/* /etc/skel/.kde4/share/config/
        else
            mkdir -v -p /etc/skel/{Desktop,Documents,Downloads,Music,Pictures,Videos}
            PIC="Pictures"
            sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/activitymanagerrc
			sed -i 's/活动/desktop/g' /etc/skel/.kde4/share/config/plasma-desktop-appletsrc

			## ati kmix config en 
			lspci |grep VGA|grep -q ATI && cp -af /usr/share/ati-kmix/en/* /etc/skel/.kde4/share/config/

        fi
            cat << _EOF >> /etc/skel/${PIC}/.directory
[Dolphin]
PreviewsShown=true
Timestamp=3000,1,1,0,0,0
_EOF

    test -d /etc/skel/${DESKTOP} && test -d /usr/share/desktop-kde && test "`ls /usr/share/desktop-kde`" && cp -a /usr/share/desktop-kde/* /etc/skel/${DESKTOP}/
    fi

fi

if [ -n "$HIPPO_LIVECD" ]; then

    # ping
    setcap cap_net_raw=ep /usr/bin/ping
    setcap cap_net_raw=ep /usr/bin/ping6

    LIVECD_USER="installer"

    useradd -m -g users -G wheel,video,audio,adm,storage ${LIVECD_USER}
    passwd -d ${LIVECD_USER}
    sed  's/root\:[^:]*:/root\:!\:/g' -i /etc/shadow

    #lightdm 
    test -f /etc/lightdm/lightdm.conf && sed -i "s/.*autologin-user=.*/autologin-user=${LIVECD_USER}/" /etc/lightdm/lightdm.conf
    # gdm
    test -f /etc/gdm/custom.conf && sed "s/daemon/a\AutomaticLoginEnable=True\nAutomaticLogin=${LIVECD_USER}" -i /etc/gdm/custom.conf
    ## kdmrc
    test -f /usr/share/config/kdm/kdmrc &&  sed -i -e 's/.*AutoLoginEnable.*/AutoLoginEnable=true/g'\
        -e "s/.*AutoLoginUser.*/AutoLoginUser=${LIVECD_USER}/g" \
        -e 's/.*AllowNullPasswd.*/AllowNullPasswd=true/g'  /usr/share/config/kdm/kdmrc

    ## 安装程序到桌面
    [[ ${HIPPO_LANG} == "zh_CN.UTF-8" ]] && DESKTOP="桌面" || DESKTOP="Desktop"
    [[ -f /usr/share/xsessions/xfce.desktop ]] && DESKTOP="Desktop"
    su - ${LIVECD_USER} -c "install -d -m755 /home/${LIVECD_USER}/${DESKTOP}"
    rm -fr /home/${LIVECD_USER}/${DESKTOP}/*
    su - ${LIVECD_USER} -c "install -m755 /usr/share/applications/qomoinstaller.desktop  /home/${LIVECD_USER}/${DESKTOP}"

    ## sony livecd autostart
    if [ "$HIPPO_EXTENDED" == "primary" ]; then
        sed -i 's|Exec=.*|& -a -s|g' /usr/share/applications/qomoinstaller.desktop 
        ln -sf /usr/share/applications/qomoinstaller.desktop /etc/xdg/autostart
    fi

    echo "firstboot setup finished"
    exit 0
fi

## uninstall qomoinstaller
rpm -e nodejs-hippo nodejs-hippo-deps nodejs rfconfig-boot
test -f /var/lib/yum/uuid && rm -f /var/lib/yum/uuid
[[ ${HIPPO_LANG} != "zh_CN.UTF-8" ]] && yum erase -q -y fcitx

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
    hwclock -s
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
    sed  's/root\:[^:]*:/root\:!\:/g' -i /etc/shadow
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
    # sony

    # do_super_dir will force to create a dir in the last part and stuff a 777 dir in it.
    do_super_dir=1

    prim_cnt=$( parted -s $destdisk p | grep primary | wc -l )
    if [ $prim_cnt -eq 4 ]; then
        echo "DEBUG: $destdisk has 4 primaries"
    else
        begin=$( getBeginOfLast )
        parted -s -m $destdisk unit MB mkpart primary $((begin + 1)) 100%

        [ $? -eq 0 ] && do_mkfs=mkfs.ext3
    fi

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

# format created partition, it MUST be the last partition
last_part=$( parted -s -m $destdisk p | awk -F: 'END {print $1}' )
part=${destdisk}${last_part}

if [ -n "$do_mkfs" ]; then
    [ -b "$part" ] && $do_mkfs -q $part
fi

if [ -n "$do_super_dir" ]; then
    tmpdir=$( mktemp -d )
    if [ -d "$tmpdir" ]; then
        mount $part $tmpdir
        mkdir -p $tmpdir/hdd
        chmod 777 $tmpdir/hdd
        umount $part
        rmdir $tmpdir
    fi
fi

echo "firstboot setup finished"
exit 0
