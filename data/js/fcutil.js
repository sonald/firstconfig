/*
 * =====================================================================================
 *
 *       Filename:  fcutil.js
 *
 *    Description:  firstconfig supporting lib
 *
 *        Version:  1.0
 *        Created:  08/31/2012 09:53:18 PM
 *       Revision:  none
 *
 *         Author:  Sian Cao (sonald), yinshuiboy@gmail.com
 *        Company:  Red Flag Linux Co. Ltd
 *
 * =====================================================================================
*/

(function(global, undefined) {
    "use strict";

    global.firstcfg = {
        options: {
            mode: '', // livecd or firstboot
            lang: 'en_US.UTF-8',
            timezone: 'Asia/Shanghai',
            username: '',
            passwd: ''
        },

        notify: function(elem, msg) {
            var $elem = $(elem);
            $elem.tooltip({
                title: msg,
                placement: 'right',
                trigger: 'manual'
            })
            $elem.tooltip('show');
            setTimeout(function() {
                $elem.tooltip('destroy');
            }, 1000);
        },

        validate: function() {
            var opts = this.options;
            console.log(opts);

            if (opts.mode === 'livecd') {
                return {
                    status: true
                };
            }

            // check username
            var usrname = opts.username;
            var reUsername = /^[a-z_][a-z0-9_-]*[$]?$/;
            if ( !usrname || !reUsername.test(usrname) ) {
                return {
                    status: false,
                    entry: 'username',
                    reason: 'username is empty or invalid'
                };
            }

            var res = hostobj.request( "validate", JSON.stringify({
                entry: 'username',
                value: usrname
            }) );

            res = JSON.parse(res);
            console.log(res);
            if (res.status === false) {
                return res;
            }

            return {
                status: true
            };
        },

        submit: function() {
            var res = hostobj.request("send", JSON.stringify(this.options));
            return JSON.parse(res);
        }
    };

})(window);

