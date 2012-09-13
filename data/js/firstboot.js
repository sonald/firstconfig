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
    }


    // handle lang switching

    var uicomps = firstcfg.uicomponents();
    console.log(uicomps);
    setupUI(uicomps);

    var sys_lang = uicomps.RF_LANG ? uicomps.RF_LANG : firstcfg.systemLang();

    function toggleLicenseFor(vendor, src) {
        var $license = $( '#ui_' + vendor + '_license' );
        //var tmpl = document.querySelector('#license_template').innerHTML;
        //$license.html( tmpl.replace('%1', src) );
        $license.find('iframe').attr('src', src);
        return $license;
    }

    // license handling
    function registerLicenseHandler(host) {
        var $btn = host.find('.mycheckbox');

        var controller = {
            agree: function() {
                $btn.addClass('checked');
            },

            disagree: function() {
                $btn.removeClass('checked');
            },

            toggle: function() {
                $btn.toggleClass('checked');
            }
        };

        host.on('click', '.mycheckbox', function() {
            controller.toggle();
        });

        return controller;
    }

    function setupLicenseHandlers() {
        if (uicomps.RF_RFLICENSE) {
            var rf_handler = registerLicenseHandler( $('#ui_redflag_license') );
            rf_handler.agree();
        }

        if (uicomps.RF_HWLICENSE && firstcfg.isOEM()) {
            var oem_handler = registerLicenseHandler( $('#ui_oem_license') );
            oem_handler.disagree();
        }
    }

    setupLicenseHandlers();

    $('body').on('languageChanged.firstboot', function() {
        // RF_LANG exists, use sys_lang as default
        var locale_choice = sys_lang;
        if (!uicomps.RF_LANG) {
            locale_choice = $langs.find('tr.info').data('locale');
        }
        var lang_choice = /(\S+_[^.]+)(\..*)?/.exec(locale_choice)[1];

        if (uicomps.RF_RFLICENSE) {
            var $rf = toggleLicenseFor('redflag',
                'licenses/redflag_licence_' + lang_choice + '.html');
        }

        if ( uicomps.RF_HWLICENSE && firstcfg.isOEM() ) {
            toggleLicenseFor('oem', 'oem/licence_' + lang_choice + '.html');
        }

        firstcfg.loadTranslation(lang_choice);
    });


    if (uicomps.RF_LANG) { // means lang already set, need no lang choice
        $('body').trigger('languageChanged.firstboot');

    } else {
        // languages
        var $langs = controlMap.lang;
        $langs.on('mouseover', 'tr', function() {
            $(this).addClass('success');
        });

        $langs.on('mouseout', 'tr', function() {
            $(this).removeClass('success');
        });

        $langs.on('click', 'tr', function() {
            $langs.find('.info').removeClass('info');
            $(this).toggleClass('info');
            $('body').trigger('languageChanged.firstboot');
        });

        $('tr[data-locale="' + sys_lang + '"]').trigger('click');
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
        controlMap.hostname.val('-redflag');
    }

    // start journey: check all necessary fields and submit results
    $('#start').bind('click', function() {
        // collect configs
        firstcfg.options.mode = "firstboot";

        if (uicomps.RF_FULLDISK) {
            firstcfg.options.fulldisk = uicomps.RF_FULLDISK;
        }

        if (uicomps.RF_EXTENDED) {
            firstcfg.options.extended = uicomps.RF_EXTENDED;
        }

        if (uicomps.RF_LANG) {
            firstcfg.options.lang = uicomps.RF_LANG;
        } else {
            firstcfg.options.lang = controlMap.lang.find('tr.info').data('locale');
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
        }

        function checkLicense(ui) {
            var id = ui + ' .mycheckbox';
            var licenseAgreed = $(id).hasClass('checked');
            if (!licenseAgreed) {
                firstcfg.notify( ui + ' b',
                    firstcfg.i18n.gettext('you need to agree all licenses to continue' ));
                return false;
            }

            return true;
        }

        if (uicomps.RF_RFLICENSE && !checkLicense('#ui_redflag_license')) {
            return false;
        }

        if (uicomps.RF_HWLICENSE && !checkLicense('#ui_oem_license')) {
            return false;
        }

        console.log('before validate: %s', JSON.stringify(firstcfg.options));

        var res = firstcfg.validate();
        console.log(res);
        if ( !res.status ) {
            firstcfg.notify( controlMap[res.entry], res.reason );
            return false;
        }

        res = firstcfg.submit();
        console.log(res);
        if ( res.status ) {
            // quit Fisrt config
            console.log('closeWindow');
            window.close();
            hostobj.closeWindow();
        }
    });
});

