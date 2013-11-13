'use strict'

###
The JoinCtrl is responsible for collecting the username and calling the PubNub.init() method
when the "Join" button is clicked.
###
angular.module('PubNubAngularApp')
  .controller 'JoinCtrl', ($rootScope, $scope, $location, PubNub) ->
    $scope.data = {username:'Anonymous ' + Math.floor(Math.random() * 1000)}

    $scope.join = ->
      $rootScope.data ||= {}
      $rootScope.data.username = $scope.data?.username

      PubNub.init({
        subscribe_key : 'demo'
        publish_key   : 'demo'
        uuid          : Math.floor(Math.random() * 1000000) + '__' + $scope.data.username
      })
      
      $location.path '/chat'
      
    $(".prettyprint")


###
The ChatCtrl is responsible for creating, displaying, subscribing to, and
chatting in channels
###
angular.module('PubNubAngularApp')
  .controller 'ChatCtrl', ($rootScope, $scope, $location, PubNub) ->
    $location.path '/join' unless PubNub.initialized()
    
    ### Use a "control channel" to collect channel creation messages ###
    $scope.controlChannel = '$control$channel'
    $scope.channels = []

    ### Publish a chat message ###
    $scope.publish = () ->
      console.log 'publish', $scope
      PubNub.ngPublish { channel: $scope.selectedChannel, message: {text:$scope.newMessage, user:$scope.data.username} }
      $scope.newMessage = ''

    ### Create a new channel ###
    $scope.createChannel = () ->
      console.log 'createChannel', $scope
      return unless $scope.newChannel
      channel = $scope.newChannel
      $scope.newChannel = ''

      # publish the channel creation message to the control channel
      PubNub.ngPublish { channel: $scope.controlChannel, message: channel }

      # wait a tiny bit before selecting the channel to allow time for the presence
      # handlers to register
      setTimeout ->
        $scope.subscribe channel
        $scope.showCreate = false
      , 100


    ### Select a channel to display chat history & presence ###
    $scope.subscribe = (channel) ->
      console.log 'subscribe', channel
      return if channel == $scope.selectedChannel
      PubNub.ngUnsubscribe { channel: $scope.selectedChannel } if $scope.selectedChannel
      $scope.selectedChannel = channel
      $scope.messages = ['Welcome to ' + channel]

      PubNub.ngSubscribe { channel: $scope.selectedChannel }

      $rootScope.$on PubNub.ngPrsEv($scope.selectedChannel), (ngEvent, payload) ->
        $scope.$apply ->
          $scope.users = PubNub.map PubNub.ngListPresence($scope.selectedChannel), (x) -> x.replace(/\w+__/, "")

      PubNub.ngHereNow { channel: $scope.selectedChannel }

      $rootScope.$on PubNub.ngMsgEv($scope.selectedChannel), (ngEvent, payload) ->
        msg = if payload.message.user then "[#{payload.message.user}] #{payload.message.text}" else "[unknown] #{payload.message}"
        $scope.$apply -> $scope.messages.unshift msg

      PubNub.ngHistory { channel: $scope.selectedChannel, count:500 }


    ### When controller initializes, subscribe to retrieve channels from "control channel" ###
    PubNub.ngSubscribe { channel: $scope.controlChannel }

    ### Register for channel creation message events ###
    $rootScope.$on PubNub.ngMsgEv($scope.controlChannel), (ngEvent, payload) ->
      $scope.$apply -> $scope.channels.push payload.message if $scope.channels.indexOf(payload.message) < 0

    ### Get a reasonable historical backlog of messages to populate the channels list ###
    PubNub.ngHistory   { channel: $scope.controlChannel, count:500 }

    ### and finally, enter the 'WaitingRoom' channel ###
    $scope.newChannel = 'WaitingRoom'
    $scope.createChannel()
