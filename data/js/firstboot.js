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

    // languages 
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

    // timezone
    var tzSelect = document.querySelector('#timezone');
    var opt_tmpl = "<option value='%1'>%1</option>";
    var len = TZ_DATA.length;
    var opts = "<option value=''></option>";
    for (var i = 0; i < len; i++) {
        opts += opt_tmpl.replace(/%1/g, TZ_DATA[i]);
    }
    tzSelect.innerHTML = opts;
    $(tzSelect).select2({
        placeholder: "Choose your timezone",
        width: "60%"
    });
    $(tzSelect).select2("val", "Asia/Shanghai");

    // username
    
    $('#start').bind('click', function() {
        window.close();
    });
});

