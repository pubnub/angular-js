'use strict'

angular.module('PubNubAngularApp', ["pubnub.angular.service"])
  .config ($routeProvider) ->
    $routeProvider
      .when '/join',
        templateUrl: 'views/join.html'
        controller: 'JoinCtrl'
      .when '/chat',
        templateUrl: 'views/chat.html'
        controller: 'ChatCtrl'
      .otherwise
        redirectTo: '/join'
