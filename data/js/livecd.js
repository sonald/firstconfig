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

    var $langs = $('#languages');

    $langs.on('click', 'input[type=radio]', function() {
        setTimeout(function() {
            $('body').trigger('languageChanged.livecd');
        }, 0);
    });

    var sys_lang = firstcfg.systemLang();

    $('body').on('languageChanged.livecd', function() {
        console.log('switch ui');
        var locale_choice = $langs.find('input:checked').val();
        var lang_choice = /(\S+_[^.]+)(\..*)?/.exec(locale_choice)[1];

        firstcfg.loadTranslation(lang_choice);
    });

    // force zh_CN as default
    sys_lang = 'zh_CN.UTF-8';
    $('input[value="' + sys_lang + '"]').trigger('click');

    function submitHandler(event) {
        // collect configs
        firstcfg.options.mode = "livecd";
        firstcfg.options.lang = $langs.find('input:checked').val();

        var res = firstcfg.validate();
        console.log(res);
        if ( !res.status ) {
            alert(res.reason);
            return;
        }

        res = firstcfg.submit();
        console.log(res);
        if (event.data !== null) {
            event.data();
            res.status = false;
        }
        if ( res.status ) {
            // quit First config
            console.log('closeWindow');
            window.close();
            hostobj.closeWindow();
        }
    }

    $('#start').bind('click', submitHandler);
    $('#install').bind('click', hostobj.installer, submitHandler);
});

