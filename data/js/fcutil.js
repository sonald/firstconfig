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

/*jslint browser: true, devel: true, jquery:true*/
/*global hostobj: false*/

(function(global, undefined) {
    "use strict";

    function remoteRequest(cmd, args) {
        args = args || {};
        if (typeof args !== "string") {
            args = JSON.stringify( args );
        }
        var res = hostobj.request(cmd, args);
        return JSON.parse(res);
    }

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
            });

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

            var res = remoteRequest( "validate", {
                entry: 'username',
                value: usrname
            } );

            console.log(res);
            if (res.status === false) {
                return res;
            }

            return {
                status: true
            };
        },

        submit: function() {
            return remoteRequest( "send", this.options );
        },

        systemLang: function() {
            return remoteRequest( "systemLang" ).LANG;
        },

        //TODO: impliment it!
        isOEM: function(oem) {
            return true;
        }
    };

})(window);

