angular.module('PubNubAngularApp', ["pubnub.angular.service", 'ngRoute']).config(function ($routeProvider) {
    'use strict';

    return $routeProvider.when('/join', {
        templateUrl: 'views/join.html',
        controller: 'JoinCtrl'
    }).when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
    }).otherwise({
        redirectTo: '/join'
    });
});
