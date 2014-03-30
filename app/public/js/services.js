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
    .factory("Repository", function($resource) {
        return $resource('/api/repository');
    })
    .factory("Bugzilla", function ($resource) {
        return $resource('/api/bugzilla/:product/:year/:month');
    })
    .factory("Entries", function($resource) {
        return $resource('/api/entries/:product/:year/:month')
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
    .factory('bubbleChartConfig', function($rootScope) {
        var chart =
        {
            exporting: {enabled: true},
            options: {
                chart: {
                    height: 600,
                    type: 'bubble',
                    zoomType: 'xy'
                },
                plotOptions: {
                    bubble: {
                        minSize:0,
                        maxSize:"10%"
                    }
                },
                tooltip: {
                    crosshairs: [false,false]
                }
            },
            title: {
                text: 'Commits'
            },
            xAxis: {},
            yAxis: {
                categories: [],
                labels: {
                    formatter: function (value) {
                        var name = this.value;
                        var url = '<a href="#/chart/' + name + '">' + name + '</a>';
                        return url;
                    },
                    useHTML: true
                }
            }
        };
        return chart;
    })
    .factory('splineChartConfig', function() {
            var chart =
            {
                exporting: {enabled: true},
                options: {
                    chart: {
                        type: 'areaspline'
                    },
                    tooltip: {
                        crosshairs: [false,false]
                    }
                },
                title: {
                    text: 'Commits'
                },
                xAxis: {},
                yAxis: {
                    min: 0
                }
            };
        return chart;
    });
