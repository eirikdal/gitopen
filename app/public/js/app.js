'use strict';

// Declare app level module which depends on filters, and services

angular.module('gitopen', [
        'gitopen.controllers',
        'gitopen.filters',
        'gitopen.services',
        'gitopen.directives'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/index',
                controller: 'IndexCtrl'
            });

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix = '!';
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
