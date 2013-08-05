'use strict'

angular.module('PubNubAngularApp', ["pubnub.angular.service"])
  .config ($routeProvider) ->
    $routeProvider
      .when '/',
        templateUrl: 'views/main.html'
        controller: 'MainCtrl'
      .otherwise
        redirectTo: '/'
