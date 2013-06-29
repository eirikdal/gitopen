'use strict';

/* Controllers */

angular.module('gitopen.controllers', ['gitopen.services']).
    controller('IndexCtrl',function ($scope, socket, flash) {
        $scope.contestants = [];

        socket.emit('listContestants');

        // Incoming
        socket.on('onContestantsListed', function (data) {
            $scope.contestants = data;
        });

        socket.on('onContestantUpdated', function (data) {
            flash.pop({title: "New commit", body: "Foo commited", type: "info"});

            var contestant = _.findWhere($scope.contestants, {name: data.name});
            if (contestant) {
                contestant.score = data.score;
            } else {
                $scope.contestants.push(data);
            }

        });

        var _resetFormValidation = function () {
            $("input:first").focus();
            var $dirtyInputs = $("#ldrbd").find(".new input.ng-dirty")
                .removeClass("ng-dirty")
                .addClass("ng-pristine");
        };

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
            // or something like
            // socket.removeListener(this);
        });
    });
