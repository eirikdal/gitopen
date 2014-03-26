'use strict';

/* Controllers */

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

angular.module('gitopen.controllers', ['gitopen.services', 'gitopen.filters']).
    controller('IndexCtrl',function ($scope, socket, flash, contestants, Commit) {
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
    .controller('HistoryCtrl', function($scope, History, chartConfig, Bugzilla, Repository, bubbleChartConfig) {
        $scope.chartSeries = [
            {
                "name": "Commits",
                "data": []
            }
        ];
        $scope.chartConfig = bubbleChartConfig;
        $scope.chartConfig.series = $scope.chartSeries;

        Repository.query(function(repositories) {
            var repos = _.map(repositories, function(rep) { return rep.name; });
            $scope.repositories = repos;
            $scope.chartConfig.yAxis.categories = repos;
        });

        var queryBugzilla = function() {
            Bugzilla.query(function(bugzilla) {
                var test2 = _.map(bugzilla, function(val) {
                    return val.Timeforbruk;
                });
                $scope.chartConfig.series[1].data = test2;
            });
        };

        function refresh(repositories, year) {
            $scope.chartConfig.series[0].data = [];

            History.query({repository: repositories}, function(test){
                console.log(test);
            })
//            _.each(repositories, function (repository, idx) {
//                History.get({"name[]": repository}, function (history) {
//                                this.createSplineChart(history);
//                    createBubbleChart(history, idx, year);
//                })
//            })
        }

        $scope.$watch('year', function(year) {
            if (year === undefined) return;
            refresh($scope.repositories, year);
        });

        var createSplineChart = function (history) {
            var test = _.pairs(history.dates);
            var weeks = new Array();
            weeks[0] = 0;
            _.each(test, function (val) {
                var week = new Date(val[0]).getWeek() - 1;
                var number = parseInt(val[1]);
                if (weeks[week] === undefined) {
                    weeks[week] = number;
                } else {
                    weeks[week] += number;
                }
            });
            $scope.chartConfig.series[0].data = weeks;
        };

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
