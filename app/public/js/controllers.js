'use strict';

/* Controllers */

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

angular.module('gitopen.controllers', ['gitopen.services', 'gitopen.filters','ng-breadcrumbs']).
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
    .controller('SplineChartCtrl', function($scope, History, splineChartConfig, $routeParams, breadcrumbs) {
        $scope.breadcrumbs = breadcrumbs;
        $scope.chartConfig = splineChartConfig;
        $scope.chartConfig.series = [
            {
                "name": "Commits",
                "data": []
            }
        ];

        var createSplineChart = function (points, yearId) {
            var months = [0,0,0,0,0,0,0,0,0,0,0,0];
            _.each(months, function(n, idx) {
                var year = points.years[yearId];
                if (year === undefined) {
                    months[idx] = [idx,0];
                } else {
                    var month = year.months[idx+1];
                    months[idx] = [idx,month != undefined ? month.commits : 0];
                }
            });
            $scope.chartConfig.series[0].data = $scope.chartConfig.series[0].data.concat(months);
        };

        var refresh = function (repositories, year) {
            $scope.chartConfig.series[0].data = [];

            History.get({id: $routeParams.id}, function(repository){
                createSplineChart(repository, year);
            })
        };

        var queryBugzilla = function() {
            Bugzilla.query(function(bugzilla) {
                var test2 = _.map(bugzilla, function(val) {
                    return val.Timeforbruk;
                });
                $scope.chartConfig.series[1].data = test2;
            });
        };

        $scope.$watch('year', function(year) {
            if (year === undefined) return;
            refresh($scope.repositories, year);
        });
    })
    .controller('BubbleChartCtrl', function($scope, History, Bugzilla, Repository, bubbleChartConfig, breadcrumbs) {
        $scope.breadcrumbs = breadcrumbs;
        $scope.chartSeries = [
            {
                "name": "Commits",
                "data": []
            }
        ];
        $scope.chartConfig = bubbleChartConfig;
        $scope.chartConfig.series = $scope.chartSeries;

        Repository.query(function(repositories) {
            var repos = _.map(repositories, function(rep) { return rep.name; }),
                categories = _.map(repos, function(r) { return r.split('/').reverse()[1]; });

            $scope.repositories = repos;
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

        $scope.$watch('year', function(year) {
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
