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

    $('#start').bind('click', function() {
        // collect configs
        firstcfg.options.mode = "livecd";
        firstcfg.options.lang = $langs.find('tr.info').data('locale');

        var res = firstcfg.validate();
        console.log(res);
        if ( !res.status ) {
            alert(res.reason);
            return;
        }

        res = firstcfg.submit();
        console.log(res);
        if ( res.status ) {
            // quit First config
            console.log('closeWindow');
            window.close();
            hostobj.closeWindow();
        }
    });
});

