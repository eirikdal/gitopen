'use strict';

angular.module('gitopen', [
    "highcharts-ng", 'ngRoute',
    'gitopen.controllers',
    'gitopen.filters',
    'gitopen.services',
    'gitopen.directives',
    'ng-breadcrumbs'
]).config(function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
                templateUrl: 'partials/index',
                label: 'index'
            })
            .when('/leaderboard', {
                templateUrl: 'partials/leaderboard',
                controller: 'LeaderboardCtrl', resolve: {
                    contestants: function ($q, Contestant) {
                        var d = $q.defer();
                        Contestant.query(function (contestants) {
                            d.resolve(contestants);
                        });
                        return d.promise;
                    }
                },
                label: 'leaderboard'
            })
            .when('/chart', {
                templateUrl: 'partials/chart',
                controller: 'HistoryCtrl',
                label: 'charts'
            })
            .when('/commit/:id', {
                templateUrl: 'partials/commit',
                controller: 'CommitCtrl', resolve: {
                    commits: function ($q, $route, Commit) {
                        var d = $q.defer();
                        var query = {id: $route.current.params.id, search: "committer"};
                        Commit.query(query, function (resp) {
                            d.resolve(resp);
                        });
                        return d.promise;
                    }
                },
                label: 'commit'
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
