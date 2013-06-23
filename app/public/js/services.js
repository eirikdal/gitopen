'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
    .factory('GitOpen', function($resource) {
        return $resource("/api/open");
    })
    .factory('Name', function($resource) {
        return $resource("/api/name");
    })
    .factory('socket', function($rootScope) {
	    var socket = io.connect();
	    return {
		    on: function(eventName, callback) {
			    socket.on(eventName, function() {
				    var args = arguments;
				    $rootScope.$apply(function() {
					    callback.apply(socket, args);
				    });
			    });
		    },
		    emit: function(eventName, data, callback) {
			    socket.emit(eventName, data, function() {
				    var args = arguments;
				    $rootScope.$apply(function() {
					    if(callback) {
						    callback.apply(socket, args);
					    }
				    });
			    });
		    }
	    };
    })
    .value('version', '0.1');
