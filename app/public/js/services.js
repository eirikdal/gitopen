'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('gitopen.services', ['ngResource'])
    .factory('Contestant', function ($resource) {
        return $resource("/api/contestant/:id");
    })
    .factory('Commit', function ($resource) {
        return $resource('/api/commit/:search/:id');
    })
    .factory("History", function ($resource) {
        return $resource('/api/history/:id');
    })
    .factory("flash", function ($rootScope) {
        var queue = [], currentMessage = {};

        $rootScope.$on('$routeChangeSuccess', function () {
            if (queue.length > 0)
                currentMessage = queue.shift();
            else
                currentMessage = {};
        });

        return {
            set: function (message) {
                var msg = message;
                queue.push(msg);

            },
            get: function (message) {
                return currentMessage;
            },
            pop: function (message) {
                switch (message.type) {
                    case 'success':
                        toastr.success(message.body, message.title);
                        break;
                    case 'info':
                        toastr.info(message.body, message.title);
                        break;
                    case 'warning':
                        toastr.warning(message.body, message.title);
                        break;
                    case 'error':
                        toastr.error(message.body, message.title);
                        break;
                }
            }
        }
    })
    .factory('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            removeAllListeners: function () {
                socket.removeAllListeners();
            },
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    })
    .value('version', '0.1')
    .factory('chartConfig', function() {
            var test =
            {
                options: {
                    chart: {
                        type: 'bubble'
                    }
                },
                title: {
                    text: 'Commits'
                },
                xAxis: {
                    type: "datetime",
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    }
                }
            };
        return test;
    });
