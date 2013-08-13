'use strict'

angular.module('PubNubAngularApp')
  .controller 'MainCtrl', ($scope, PubNub) ->

    $scope.publish = () ->
      console.log 'publish', $scope
      PubNub.publish
        channel: $scope.selectedChannel
        message: $scope.newMessage
      $scope.newMessage = ''

    $scope.subscribe = () ->
      console.log 'subscribe', $scope
      return unless $scope.newChannel
      $scope.channels.push($scope.newChannel) unless ($scope.newChannel in $scope.channels)
      PubNub.subscribe
        channel: $scope.channels.join(",")
        message: (message, env, channel) ->
          $scope.$apply () -> $scope.messages.unshift "#{channel} -> #{message}"
      $scope.selectedChannel = $scope.newChannel
      $scope.newChannel = ''

    $scope.select = (channel) ->
      console.log 'select', channel
      $scope.selectedChannel = channel
      
    $scope.channels = []
    $scope.messages = ['Welcome']
    $scope.newChannel = $scope.selectedChannel = 'Waiting_Room'
    $scope.subscribe()