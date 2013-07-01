'use strict';

/* Controllers */

angular.module('gitopen.controllers', ['gitopen.services', 'gitopen.filters']).
    controller('IndexCtrl',function ($scope, socket, flash, Contestant, Commit) {
        $scope.contestants = [];

        Contestant.query(function(resp) {
            _.each(resp, function(contestant) {
                updateScore(contestant);
            });

            $scope.contestants = resp;
        });

        var updateScore = function(contestant) {
            var query = {id: contestant._id, search:"committer"};
            Commit.query(query, function (commits) {
                contestant.score = _.reduce(commits, function (memo, commit) {
                    return commit.score + memo;
                }, 0);
            });
        };

        socket.on('onCommit', function (data) {
            flash.pop({title: "New commit", body: data.committer.name + " commited", type: "info"});

            var contestant = _.findWhere($scope.contestants, {name: data.committer.name});
            if (!contestant) {
                $scope.contestants.push(data.committer);
            }
            updateScore(contestant);
        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
    })
    .controller('CommitCtrl',function ($scope, $routeParams, socket, flash, Commit) {
        socket.on('onCommit', function (data) {
            flash.pop({title: "New commit", body: data.committer.name + " commited", type: "info"});

            var commit = _.findWhere($scope.commits, {committer: { name: data.committer.name}});
            if (!commit) {
                $scope.commits.push(data)
            }
        });

        var query = {id: $routeParams.id, search:"committer"};
        Commit.query(query, function(resp) {
            $scope.commits = resp;
        })
    });
