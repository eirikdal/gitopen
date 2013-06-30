'use strict';

/* Controllers */

angular.module('gitopen.controllers', ['gitopen.services', 'gitopen.filters']).
    controller('IndexCtrl',function ($scope, socket, flash, Contestant) {
        $scope.contestants = [];

        Contestant.query(function(resp) {
            $scope.contestants = resp;
        })

        socket.on('onCommit', function (data) {
            flash.pop({title: "New commit", body: data.committer.name + " commited", type: "info"});

            var contestant = _.findWhere($scope.contestants, {name: data.committer.name});
            if (contestant) {
                contestant.score = data.committer.score;
            } else {
                $scope.contestants.push(data.committer);
            }
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
        var commits = Commit.query(query, function(resp) {
            $scope.commits = resp;
        })
    });
