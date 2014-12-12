'use strict';

var when = require('when');

var hasOwn = {}.hasOwnProperty;

var utils = {
    /*
     * Provide simple "Class" extension mechanism
     */
    protoExtend: function (sub) {
        var Super = this;
        var Constructor = hasOwn.call(sub, 'constructor') ? sub.constructor : function () {
            Super.apply(this, arguments);
        };
        Constructor.prototype = Object.create(Super.prototype);
        for (var i in sub) {
            if (hasOwn.call(sub, i)) {
                Constructor.prototype[i] = sub[i];
            }
        }
        for (i in Super) {
            if (hasOwn.call(Super, i)) {
                Constructor[i] = Super[i];
            }
        }
        return Constructor;
    },
    rtrim: function (str, charlist) {
        //  discuss at: http://phpjs.org/functions/rtrim/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //    input by: Erkekjetter
        //    input by: rem
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Onno Marsman
        // bugfixed by: Brett Zamir (http://brett-zamir.me)
        //   example 1: rtrim('    Kevin van Zonneveld    ');
        //   returns 1: '    Kevin van Zonneveld'

        charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
            .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
        var re = new RegExp('[' + charlist + ']+$', 'g');
        return (str + '')
            .replace(re, '');
    },
    createDeferred: function (callback) {
        var defer = when.defer();

        if (callback) {
            defer.promise.then(function (res) {
                setTimeout(function () {
                    callback(null, res)
                }, 0);
            }, function (err) {
                setTimeout(function () {
                    callback(err, null);
                }, 0);
            });
        }

        return defer;
    }
};

module.exports = utils;