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
        $(this).trigger('languageChanged.firstboot');
    });


    // handle lang switching
    var sys_lang = firstcfg.systemLang();

    function toggleLicenseFor(vendor, src, pred) {

        var id = vendor + '_license';
        var $license = $('#' + id );

        if ($license.length === 0) {
            console.log('create license for ' + vendor);
            $license = $('<div class="section" id="' + id + '"></div>');
            $(pred).after($license);
        }

        var tmpl = document.querySelector('#license_template').innerHTML;
        $license.html( tmpl.replace('%1', src) );

        return $license;
    }

    $('form').on('languageChanged.firstboot', function() {
        var locale_choice = $langs.find('tr.info').data('locale');
        var lang_choice = /(\S+_[^.]+)(\..*)?/.exec(locale_choice)[1];

        var $rf = toggleLicenseFor('redflag',
            'licenses/redflag_licence_' + lang_choice + '.html',
            $('.section').has('#languages'));

        if ( firstcfg.isOEM() ) {
            toggleLicenseFor('oem', 'oem/licence_' + lang_choice + '.html', $rf);
        }

        setupLicenseHandlers();

        firstcfg.loadTranslation(lang_choice);
    });

    $('tr[data-locale="' + sys_lang + '"]').trigger('click');


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
        var rf_handler = registerLicenseHandler( $('#redflag_license') );
        rf_handler.agree();

        if (firstcfg.isOEM()) {
            var oem_handler = registerLicenseHandler( $('#oem_license') );
            oem_handler.disagree();
        }
    }


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

    var $passwd = controlMap.passwd;
    var $passwdAgain = controlMap.passwdAgain;
    $passwdAgain.on('change focusout', function() {
        if ($passwd.val() !== $passwdAgain.val()) {
            firstcfg.notify( $passwdAgain, firstcfg.i18n.gettext("passwd does not match") );
        }
    });

    //hostname
    controlMap.hostname.val('-redflag');

    var $usrname = controlMap.username;
    $usrname.on('keyup', function() {
        setTimeout(function() {
            controlMap.hostname.val( $usrname.val() + '-redflag' );
        }, 0);
    });


    // start journey: check all necessary fields and submit results
    $('#start').bind('click', function() {
        // collect configs
        firstcfg.options.mode = "firstboot";
        firstcfg.options.lang = $langs.find('tr.info').data('locale');
        firstcfg.options.timezone = $tzSelect.select2("val");
        firstcfg.options.hostname = controlMap.hostname.val();
        firstcfg.options.keyboard = 'en_US';
        firstcfg.options.username = $usrname.val();
        firstcfg.options.passwd = $passwd.val();

        var licenseAgreed = Array.prototype.reduce.call(
            $('.mycheckbox'), function(prev, cur, idx) {
                return prev && $(cur).hasClass('checked');
            }, true);

        if (!licenseAgreed) {
            firstcfg.notify( '#start', firstcfg.i18n.gettext('you need to agree all licenses to continue' ));
            return false;
        }

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

