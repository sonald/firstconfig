/*
 * =====================================================================================
 *
 *       Filename:  livecd.js
 *
 *    Description:
 *
 *        Version:  1.0
 *        Created:  08/30/2012 01:29:05 AM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Sian Cao (sonald), yinshuiboy@gmail.com
 *        Company:  Red Flag Linux Co. Ltd
 *
 * =====================================================================================
*/

$(function() {
    function adjustMargin() {
        var height = document.body.clientHeight;
        var ctntElem = document.getElementById('content');
        var ctntHeight = ctntElem.clientHeight;

        var marginTop = (height - ctntHeight) / 2;
        $('#content').css('margin', marginTop.toString() + 'px auto');
    }

    $(window).on('resize', adjustMargin);
    adjustMargin();


    var controlMap = {
        'lang': $('#languages'),
        'timezone': $('#timezone'),
        'username': $('#inputUsername'),
        'passwd': $('#inputPassword'),
        'passwdAgain': $('#inputPasswordAgain'),
        'hostname': $('#inputHostname')
    };

    function toggleUIComponent(id, state) {
        $(id).css('display', state);
    }

    function setupUI(uicomps) {
        toggleUIComponent('#ui_langs', (uicomps.RF_LANG ? 'none' : 'block'));
        toggleUIComponent('#ui_redflag_license', (uicomps.RF_RFLICENSE ? 'block' : 'none'));
        toggleUIComponent('#ui_oem_license', (uicomps.RF_HWLICENSE ? 'block' : 'none'));
        toggleUIComponent('#ui_timezone', (uicomps.RF_TIMEZONE ? 'block' : 'none'));
        // RF_KEYBOARD=en
        toggleUIComponent('#ui_username', (uicomps.RF_USERNAME ? 'block' : 'none'));
        toggleUIComponent('#ui_hostname', (uicomps.RF_HOSTNAME ? 'block' : 'none'));
        $('#ui_hint').hide();
    }


    // handle lang switching

    var uicomps = firstcfg.uicomponents();
    console.log(uicomps);
    setupUI(uicomps);

    var sys_lang = uicomps.RF_LANG ? uicomps.RF_LANG : 'zh_CN.UTF-8';

    function toggleLicenseFor(vendor, src) {
        var $license = $( '#ui_' + vendor + '_license' );
        $license.find('iframe').attr('src', src);
        return $license;
    }

    $('body').on('languageChanged.firstboot', function() {
        // RF_LANG exists, use sys_lang as default
        var locale_choice = sys_lang;

        if (!uicomps.RF_LANG) {
            locale_choice = controlMap.lang.find('input:checked').val();
        }

        var lang_choice = /(\S+_[^.]+)(\..*)?/.exec(locale_choice)[1];

        if (uicomps.RF_RFLICENSE) {
            var $rf = toggleLicenseFor('redflag',
                'licenses/redflag_licence_' + lang_choice + '.html');
        }

        if (uicomps.RF_HWLICENSE) {
            toggleLicenseFor('oem', 'oem/licence_' + lang_choice + '.html');
        }

        firstcfg.loadTranslation(lang_choice);
    });


    if (uicomps.RF_LANG) { // means lang already set, need no lang choice
        $('body').trigger('languageChanged.firstboot');

    } else {
        // languages
        var $langs = controlMap.lang;

        $langs.on('click', 'input[type=radio]', function() {
            setTimeout(function() {
                $('body').trigger('languageChanged.firstboot');
            }, 0);
        });

        $langs.find('[value="' + sys_lang + '"]').trigger('click');
    }


    if (uicomps.RF_TIMEZONE) {
        // timezone
        var $tzSelect = controlMap.timezone;
        var opt_tmpl = "<option value='%1'>%1</option>";
        var len = TZ_DATA.length;
        var opts = "<option value=''></option>";
        for (var i = 0; i < len; i++) {
            opts += opt_tmpl.replace(/%1/g, TZ_DATA[i]);
        }
        $tzSelect[0].innerHTML = opts;
        $tzSelect.select2({
            placeholder: "Choose your timezone",
            width: "60%"
        });
        $tzSelect.select2("val", "Asia/Shanghai");
    }

    if (uicomps.RF_USERNAME) {
        if (uicomps.RF_HOSTNAME) {
            var $usrname = controlMap.username;
            $usrname.on('keyup', function() {
                setTimeout(function() {
                    controlMap.hostname.val( $usrname.val() + '-redflag' );
                }, 0);
            });
        }

        var $passwd = controlMap.passwd;
        var $passwdAgain = controlMap.passwdAgain;
        $passwdAgain.on('change focusout', function() {
            if ($passwd.val() !== $passwdAgain.val()) {
                firstcfg.notify( $passwdAgain, firstcfg.i18n.gettext("passwd does not match") );
            }
        });
    }

    if (uicomps.RF_HOSTNAME) {
        //hostname
        controlMap.hostname.val('-host');
    }

    // start journey: check all necessary fields and submit results
    $('#start').bind('click', function(ev) {
        ev.preventDefault();

        // collect configs
        firstcfg.options.mode = "firstboot";

        if (uicomps.RF_FULLDISK) {
            firstcfg.options.fulldisk = uicomps.RF_FULLDISK;
        }


        firstcfg.options.extended = uicomps.RF_EXTENDED;


        if (uicomps.RF_LANG) {
            firstcfg.options.lang = uicomps.RF_LANG;
        } else {
            firstcfg.options.lang = controlMap.lang.find('input:checked').val();
        }

        if (uicomps.RF_TIMEZONE) {
            firstcfg.options.timezone = controlMap.timezone.select2("val");
        }

        if (uicomps.RF_HOSTNAME) {
            firstcfg.options.hostname = controlMap.hostname.val();
        }

        firstcfg.options.keyboard = 'en_US';

        if (uicomps.RF_USERNAME) {
            firstcfg.options.username = controlMap.username.val();
            firstcfg.options.passwd = controlMap.passwd.val();
            if (controlMap.passwd.val() !== controlMap.passwdAgain.val()) {
                firstcfg.notify( controlMap.passwdAgain, firstcfg.i18n.gettext("passwd does not match") );
                return false;
            }
        }

        console.log('before validate: %s', JSON.stringify(firstcfg.options));

        var res = firstcfg.validate();
        console.log(res);
        if ( !res.status ) {
            firstcfg.notify( controlMap[res.entry], res.reason );
            return false;
        }

        function doSubmit() {
            var res = firstcfg.submit();
            console.log(res);
            if ( res.status ) {
                // quit Fisrt config
                console.log('closeWindow');
                window.close();
                hostobj.closeWindow();
            }
        }

        $('#ui_hint').fadeIn('slow', doSubmit);
    });
});

