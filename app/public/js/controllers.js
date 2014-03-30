'use strict';

/* Controllers */

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

Highcharts.dateFormats = {
    W: function (timestamp) {
        var date = new Date(timestamp),
            day = date.getUTCDay() == 0 ? 7 : date.getUTCDay(),
            dayNumber;
        date.setDate(date.getUTCDate() + 4 - day);
        dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000);
        return 1 + Math.floor(dayNumber / 7);

    }
};

angular.module('gitopen.controllers', ['gitopen.factories', 'gitopen.services', 'gitopen.filters', 'ng-breadcrumbs']).
    controller('LeaderboardCtrl',function ($scope, socket, flash, contestants, Commit, breadcrumbs) {
        $scope.breadcrumbs = breadcrumbs;
        var updateScore = function(contestant) {
            var query = {id: contestant._id, search:"committer"};
            Commit.query(query, function (commits) {
                contestant.score = _.reduce(commits, function (memo, commit) {
                    return commit.score + memo;
                }, 0);
            });
        };

        $scope.contestants = contestants;
        _.each($scope.contestants, function(contestant) {
            updateScore(contestant);
        });

        socket.on('onCommit', function (data) {
            flash.pop({title: "New commit", body: data.committer.name + " commited", type: "info"});

            var contestant = _.findWhere($scope.contestants, {name: data.committer.name});
            if (!contestant) {
                data.committer.score = data.score;
                $scope.contestants.push(data.committer);
            } else {
                updateScore(contestant);
            }
        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
    })
    .controller('MonthChartCtrl', function($scope, History, Entries, Bugzilla, splineChartConfig, $routeParams, $rootScope, breadcrumbs, dateParams, $locale, $location) {
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.breadcrumbs = breadcrumbs;
        $scope.breadcrumbs.generateBreadcrumbs();
        $scope.dateParams = dateParams;
        $scope.dateParams.year = _.find(dateParams.years, function(y) { return y === $routeParams.year});
        $scope.dateParams.month = $scope.months.indexOf($scope.months[parseInt($routeParams.month)]);
        $scope.chart = $routeParams.id;
        $scope.chartConfig = splineChartConfig;
        $scope.chartConfig.xAxis.categories = [];
        $scope.chartConfig.xAxis.dateTimeLabelFormats = {
            week: '%e. %b'
        };
        $scope.chartConfig.xAxis.type = 'datetime';
        $scope.chartConfig.xAxis.tickInterval = 7 * 24 * 36e5;
        $scope.chartConfig.xAxis.labels = {
            format: 'Uke {value:%W}',
                rotation: -45,
                y: 30,
                align: 'center'
        }
        $scope.chartConfig.series = [
            {
                "name": "Bugzilla",
                "data": []
            },
            {
                "name": "Commits",
                data: []
            }
        ];

        //Month is 1 based
        function daysInMonth(month,year) {
            return new Date(year, month, 0).getDate();
        }

        var createSplineChart = function (points, yearId) {
            var month = [];
            for (var idx = 1; idx <= daysInMonth($scope.dateParams.month, $scope.dateParams.year); idx++) {
                var year = points.years[yearId];
                if (year === undefined) {
                    month.push(0);
                    continue;
                }
                var m = year.months[$scope.dateParams.month];
                if (m === undefined) {
                    month.push(0);
                    continue;
                }

                var days = m.days;
                var day = days[idx];
                if (day === undefined) {
                    month.push([Date.UTC($scope.dateParams.year, $scope.dateParams.month-1, idx-1), 0]);
                } else {
                    month.push([Date.UTC($scope.dateParams.year, $scope.dateParams.month-1, idx-1), day.commits]);
                }
            }
            $scope.chartConfig.series[1].data = month;//$scope.chartConfig.series[1].data.concat(months);
        };

        var refresh = function (year, month) {
            $scope.chartConfig.series[0].data = [];
            $scope.chartConfig.series[1].data = [];

            History.get({id: $routeParams.id, year: year, month: month}, function(repository){
                createSplineChart(repository, year);
            });

            Entries.query({year: year, month: month, product: $routeParams.id}, function(entries) {
                $scope.entries = entries;
            });

            Bugzilla.query({product: $routeParams.id, year: year, month: month}, function(bugzilla) {
                var days = [];
                for (var idx = 1; idx <= daysInMonth(month, year); idx++) {
                    var day = _.find(bugzilla, function(day) { return day.DAY === idx; });
                    if (day === undefined) {
                        days.push([Date.UTC($scope.dateParams.year, $scope.dateParams.month-1, idx-1), 0]);
                    } else {
                        days.push([Date.UTC($scope.dateParams.year, $scope.dateParams.month-1, idx-1), day.Timeforbruk]);
                    }
                }
                $scope.chartConfig.series[0].data = days;
            });
        };

        refresh($scope.dateParams.year, $scope.dateParams.month);

        $scope.$watch('dateParams', function(x) {
            $location.path('/chart/' + $scope.chart + '/' + x.year + '/' + x.month);
        }, true);
    })
    .controller('SplineChartCtrl', function($scope, History, Bugzilla, splineChartConfig, $routeParams, $rootScope, breadcrumbs, $location, dateParams, $locale) {
        $scope.dateParams = dateParams;
        $scope.breadcrumbs = breadcrumbs;
        $scope.breadcrumbs.generateBreadcrumbs();
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.dateParams.year = _.find(dateParams.years, function(y) { return y === $routeParams.year});
        $scope.dateParams.month = null;
        $scope.chart = $routeParams.id;
        $scope.chartConfig = splineChartConfig;
        $scope.chartConfig.xAxis.categories = $locale.DATETIME_FORMATS.MONTH;
        $scope.chartConfig.series = [
            {
                "name": "Bugzilla",
                "data": []
            },
            {
                "name": "Commits",
                data: []
            }
        ];

        var createSplineChart = function (points, yearId) {
            var months = [0,0,0,0,0,0,0,0,0,0,0,0];
            _.each(months, function(n, idx) {
                var year = points.years[yearId];
                if (year === undefined) {
                    months[idx] = {
                        x: idx,
                        y: 0
                    }
                } else {
                    var month = year.months[idx+1];
                    months[idx] = {
                        y: month != undefined ? month.commits : 0,
                        events: { click:
                            function() {
                                $scope.$apply($location.path('/chart/' + $scope.chart + '/' + $rootScope.year + '/' + (idx+1)));
                            }
                        }
                    }
                }
            });
            $scope.chartConfig.series[1].data = months;//$scope.chartConfig.series[1].data.concat(months);
        };

        var refresh = function (repositories, year) {
            $scope.chartConfig.series[0].data = [];
            $scope.chartConfig.series[1].data = [];

            History.get({id: $routeParams.id}, function(repository){
                createSplineChart(repository, year);
            });

            Bugzilla.query({product: $routeParams.id, year: year}, function(bugzilla) {
                var months = [0,0,0,0,0,0,0,0,0,0,0,0];
                var results = _.map(months, function(n, idx) {
                    var bugzillaMonth = _.find(bugzilla, function(bugz) { return (bugz.MONTH === idx) });
                    return bugzillaMonth != undefined ? [idx, bugzillaMonth.Timeforbruk] : [idx, 0];
                });

                $scope.chartConfig.series[0].data = results;
            });
        };

        refresh($scope.repositories, $scope.dateParams.year);

        $scope.$watch('dateParams.year', function(year) {
            if (year === undefined) return;
            $rootScope.year = year;
            refresh($scope.repositories, year);
        });
    })
    .controller('BubbleChartCtrl', function($scope, History, Bugzilla, Repository, bubbleChartConfig, breadcrumbs, $rootScope, dateParams, $routeParams) {
        $scope.dateParams = dateParams;
        $scope.dateParams.month = $routeParams.month;
        $scope.breadcrumbs = breadcrumbs;
        $scope.breadcrumbs.generateBreadcrumbs();
        $scope.chartSeries = [
            {
                "name": "Commits",
                "data": []
            }
        ];
        $scope.chartConfig = bubbleChartConfig;
        $scope.chartConfig.series = $scope.chartSeries;
        $scope.chartConfig.yAxis = {
            labels: {
                formatter: function (value) {
                    var name = this.value;
                    var url = '<a href="#/chart/' + name + '/' + $scope.dateParams.year + '">' + name + '</a>';
                    return url;
                },
                useHTML: true
            }
        }

        Repository.query(function(repositories) {
            var repos = _.map(repositories, function(rep) { return rep.name; }),
                categories = _.map(repos, function(r) { return r.split('\\').reverse()[1]; });

            $scope.repositories = repos;
            if($rootScope.year != undefined) {
                refresh($scope.repositories, $rootScope.year);
            }
            $scope.chartConfig.yAxis.categories = categories;
        });

        function refresh(repositories, year) {
            $scope.chartConfig.series[0].data = [];

            History.query({repository: repositories}, function(repositories){
                _.each(repositories, function (repository, idx) {
                    createBubbleChart(repository, idx, year);
                })
            })
        }

        $scope.$watch('dateParams.year', function(year) {
            if (year === undefined) return;
            refresh($scope.repositories, year);
        });

        var createBubbleChart = function (points, repositoryId, yearId) {
            var months = [0,0,0,0,0,0,0,0,0,0,0,0];
            _.each(months, function(n, idx) {
                var year = points.years[yearId];
                if (year === undefined) {
                    months[idx] = [idx,repositoryId,0];
                } else {
                    var month = year.months[idx+1];
                    months[idx] = [idx,repositoryId,month != undefined ? month.commits : 0];
                }
            });
            $scope.chartConfig.series[0].data = $scope.chartConfig.series[0].data.concat(months);
        };
    })
    .controller('CommitCtrl',function ($scope, $routeParams, socket, flash, commits) {
        socket.on('onCommit', function (data) {
            flash.pop({title: "New commit", body: data.committer.name + " commited", type: "info"});

            var commit = _.findWhere($scope.commits, {committer: { name: data.committer.name}});
            if (!commit) {
                $scope.commits.push(data)
            }
        });

        $scope.commits = commits;
    });
