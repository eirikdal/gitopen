'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
        'myApp.controllers',
        'myApp.filters',
        'myApp.services',
        'myApp.directives'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/view1', {
                templateUrl: 'partials/partial1',
                controller: 'MyCtrl1'
            }).
            when('/view2', {
                templateUrl: 'partials/partial2',
                controller: 'MyCtrl2'
            }).
            otherwise({
                redirectTo: '/view1'
            });

        $locationProvider.html5Mode(true);
    });

/*
// misc form validation stuff
$(function(){

    setTimeout(function(){
        // wait till angular is done populating the list

        // focus the first field
        $("input:first").focus();

        var $requiredInputs = $("#ldrbd").find("input[required]:not('.ng-dirty')");
        $requiredInputs.on("blur", function(){
            $(this)
                .removeClass("ng-pristine")
                .addClass("ng-dirty")
                .attr({
                    placeholder: "Required"
                });

        });
    }, 100);

});*/
