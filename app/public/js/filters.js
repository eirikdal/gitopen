'use strict';

/* Filters */

angular.module('gitopen.filters', [])
    .filter('interpolate', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    })
    .filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 6;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length - end.length) + end;
            }

        };
    })
    .filter('bugzilla', function() {
        return function(text) {
            return text.replace(/.*([b|B][u|U][g|G]).{1,4}(\d{4})(.*)/, '<a href="http://slfbugzilla/show_bug.cgi?id=$2">Bug $2</a> $3')
        }
    });

