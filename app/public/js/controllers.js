'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.services']).
    controller('AppCtrl',function ($scope, socket, Contestant) {
        $scope.contestants = [];

        $scope.addScore = function() {
            var contestant = Contestant.get({name:"foo"}, function() {
                contestant.score += 1;
                contestant.$save({name:"foo"});
            });
        };

        console.log('listContestants')
        socket.emit('listContestants');

        // Incoming
        socket.on('onContestantsListed', function (data) {
            console.log('onContestantsListed')
            $scope.contestants = data;
        });

        socket.on('onContestantCreated', function (data) {
            $scope.contestants.push(data);
        });

        socket.on('onContestantUpdated', function (data) {
            var contestant = _.findWhere($scope.contestants, {name: data.name});
            contestant.score = data.score;
            console.log('onContestantUpdated')
        });

        var _resetFormValidation = function () {
            $("input:first").focus();
            var $dirtyInputs = $("#ldrbd").find(".new input.ng-dirty")
                .removeClass("ng-dirty")
                .addClass("ng-pristine");
        };

        // Outgoing
        $scope.createContestant = function (display_name, score) {
            var contestant = {
                name: display_name,
                score: Number(score)
            };

            $scope.contestants.push(contestant);
            socket.emit('createContestant', contestant);

            _resetFormValidation();
        };

        $scope.$on('$destroy', function (event) {
            console.log('removing listeners')
            socket.removeAllListeners();
            // or something like
            // socket.removeListener(this);
        });
    });
