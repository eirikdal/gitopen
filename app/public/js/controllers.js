'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.services']).
    controller('AppCtrl',function ($scope, socket, GitOpen, Name) {
        $scope.contestants = [];

        socket.emit('listContestants');

        // Incoming
        socket.on('onContestantsListed', function (data) {
            $scope.contestants.push.apply($scope.contestants, data);
        });

        socket.on('onContestantCreated', function (data) {
            $scope.contestants.push(data);
        });

        socket.on('onContestantDeleted', function (data) {
            $scope.handleDeleteContestant(data.id);
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
                id: new Date().getTime(),
                display_name: display_name,
                score: Number(score)
            };

            $scope.contestants.push(contestant);
            socket.emit('createContestant', contestant);

            _resetFormValidation();
        };

        $scope.deleteContestant = function (id) {
            $scope.handleDeleteContestant(id);

            socket.emit('deleteContestant', {id: id});
        };

        $scope.handleDeleteContestant = function (id) {
            console.log('HANDLE DELETE CONTESTANT', id);

            var oldContestants = $scope.contestants,
                newContestants = [];

            angular.forEach(oldContestants, function (contestant) {
                if (contestant.id !== id) {
                    newContestants.push(contestant);
                }
            });

            $scope.contestants = newContestants;
        }
        GitOpen.get(function (resp) {

        });

        Name.get({name: "foo"}, function (resp) {
            $scope.name = resp.name;
        });
    }).
    controller('MyCtrl1',function ($scope) {
        // write Ctrl here

    }).
    controller('MyCtrl2', function ($scope) {
        // write Ctrl here

    });
