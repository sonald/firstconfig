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
        'passwd': $('#inputPassword')
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
    });

    var sys_lang = firstcfg.systemLang();
    $('tr[data-locale="' + sys_lang + '"]').trigger('click');

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

    $('#start').bind('click', function() {
        // collect configs
        firstcfg.options.mode = "firstboot";
        firstcfg.options.lang = $langs.find('tr.info').data('locale');
        firstcfg.options.timezone = $tzSelect.select2("val");
        firstcfg.options.hostname = controlMap.username.val() + '-qomo';
        firstcfg.options.keyboard = 'en_US';
        firstcfg.options.username = controlMap.username.val();
        firstcfg.options.passwd = controlMap.passwd.val();

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

