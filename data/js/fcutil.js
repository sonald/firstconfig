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
/*global hostobj: false, Jed: false*/

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
            mode: '' // livecd or firstboot
            // lang: 'en_US.UTF-8',
            // timezone: 'Asia/Shanghai',
            // username: '',
            // passwd: ''
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

        i18n: null,
        loadTranslation: function(lang) {
            var self = this;

            $.getJSON('messages/client.' + lang + '.json', function(data) {
                self.i18n = new Jed({
                    'domain': lang,
                    'locale_data': data
                });

                 //FIXME: this is terrible, a lot of reflows
                 var objs = document.querySelectorAll('[data-message]');
                 Array.prototype.forEach.call(objs, function(elem) {
                    elem.firstChild.nodeValue = self.i18n.gettext($(elem).data('message'));
                    console.log('orig: %s -> %s', $(elem).data('message'), elem.firstChild.nodeValue);
                });

             });
        },

        validate: function() {
            var self = this;
            var opts = this.options;
            var gettext;

            console.log(opts);

            if (opts.mode === 'livecd') {
                return {
                    status: true
                };
            }

            if (this.i18n) {
                gettext = function() {
                    return self.i18n.gettext.apply(self.i18n, arguments);
                };
            } else {
                gettext = function(msg) { return msg; };
            }


            if ('username' in opts) {
                // check username
                var usrname = opts.username;
                var reUsername = /^[a-z_][a-z0-9_-]*[$]?$/;
                if ( !usrname || !reUsername.test(usrname) ) {
                    return {
                        status: false,
                        entry: 'username',
                        reason: gettext('username is empty or invalid')
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

        isOEM: function() {
            return remoteRequest( "oemMode" ).status;
        },

        uicomponents: function() {
            return remoteRequest( "uicomponents" );
        }
    };

})(window);

