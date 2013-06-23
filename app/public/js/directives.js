'use strict';

/* Directives */

angular.module('myApp.directives', [])
    .directive('contestant', function(socket) {
	    var linker = function(scope, element, attrs) {
			element.hide().fadeIn();
		};

	    var controller = function($scope) {
			// Incoming
			socket.on('onContestantUpdated', function(data) {
				// Update if the same contestant
				if(data.id == $scope.contestant.id) {
					$scope.contestant.display_name = data.display_name;
					$scope.contestant.score = Number(data.score);
				}
			});

			// Outgoing
			$scope.updateContestant = function(contestant) {
				socket.emit('updateContestant', contestant);
			};

			$scope.deleteContestant = function(id) {
				$scope.ondelete({
					id: id
				});
			};
		};

	    return {
		    restrict: 'A',
		    link: linker,
		    controller: controller,
		    scope: {
			    contestant: '=',
			    ondelete: '&'
		    }
	    };
    });
