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
      $rootScope.data.city     = $scope.data?.city
      $rootScope.data.super    = $scope.data?.super
      $rootScope.data.uuid     = Math.floor(Math.random() * 1000000) + '__' + $scope.data.username

      #
      # NOTE! We include the secret & auth keys here only for demo purposes!
      #
      # In a real app, the secret key should be protected by server-only access, and
      # different/separate auth keys should be distributed by the server and used
      # for user authentication.
      #
      $rootScope.secretKey = if $scope.data.super then 'sec-c-MmIzMDAzNDMtODgxZC00YzM3LTk1NTQtMzc4NWQ1NmZhYjIy' else null
      $rootScope.authKey   = if $scope.data.super then 'ChooseABetterSecret' else null

      PubNub.init({
        subscribe_key : 'sub-c-d66562f0-62b0-11e3-b12d-02ee2ddab7fe'
        publish_key   : 'pub-c-e2b65946-31f0-4941-a1b8-45bab0032dd8'
        # WARNING: DEMO purposes only, never provide secret key in a real web application!
        secret_key    : $rootScope.secretKey
        auth_key      : $rootScope.authKey
        uuid          : $rootScope.data.uuid
        ssl           : true
      })
      
      if $scope.data.super
        ### Grant access to the SuperHeroes room for supers only! ###
        PubNub.ngGrant({channel:'SuperHeroes',auth_key:$rootScope.authKey,read:true,write:true,callback:->console.log('SuperHeroes! all set', arguments)})
        PubNub.ngGrant({channel:"SuperHeroes-pnpres",auth_key:$rootScope.authKey,read:true,write:false,callback:->console.log('SuperHeroes! presence all set', arguments)})
        # Let everyone see the control channel so they can retrieve the rooms list
        PubNub.ngGrant({channel:'__controlchannel',read:true,write:true,callback:->console.log('control channel all set', arguments)})
        PubNub.ngGrant({channel:'__controlchannel-pnpres',read:true,write:false,callback:->console.log('control channel presence all set', arguments)})

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
    $scope.controlChannel = '__controlchannel'
    $scope.channels = []

    ### Publish a chat message ###
    $scope.publish = ->
      console.log 'publish', $scope
      return unless $scope.selectedChannel
      PubNub.ngPublish { channel: $scope.selectedChannel, message: {text:$scope.newMessage, user:$scope.data.username} }
      $scope.newMessage = ''

    ### Create a new channel ###
    $scope.createChannel = ->
      console.log 'createChannel', $scope
      return unless $scope.data.super && $scope.newChannel
      channel = $scope.newChannel
      $scope.newChannel = ''

      # grant anonymous access to channel and presence
      PubNub.ngGrant({channel:channel,read:true,write:true,callback:->console.log("#{channel} all set", arguments)})
      PubNub.ngGrant({channel:"#{channel}-pnpres",read:true,write:false,callback:->console.log("#{channel} presence all set", arguments)})

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

      PubNub.ngSubscribe {
        channel: $scope.selectedChannel
        auth_key: $scope.authKey
        state: {"city":$rootScope.data?.city || 'unknown'}
        error: -> console.log arguments
      }
      $rootScope.$on PubNub.ngPrsEv($scope.selectedChannel), (ngEvent, payload) ->
        $scope.$apply ->
          userData = PubNub.ngPresenceData $scope.selectedChannel
          newData  = {}
          $scope.users    = PubNub.map PubNub.ngListPresence($scope.selectedChannel), (x) ->
            newX = x
            if x.replace
              newX = x.replace(/\w+__/, "")
            if x.uuid
              newX = x.uuid.replace(/\w+__/, "")
            newData[newX] = userData[x] || {}
            newX
          $scope.userData = newData

      PubNub.ngHereNow { channel:$scope.selectedChannel }

      $rootScope.$on PubNub.ngMsgEv($scope.selectedChannel), (ngEvent, payload) ->
        msg = if payload.message.user then "[#{payload.message.user}] #{payload.message.text}" else "[unknown] #{payload.message}"
        $scope.$apply -> $scope.messages.unshift msg

      PubNub.ngHistory { channel: $scope.selectedChannel, auth_key: $scope.authKey, count:500 }

    ### When controller initializes, subscribe to retrieve channels from "control channel" ###
    PubNub.ngSubscribe { channel: $scope.controlChannel }

    ### Register for channel creation message events ###
    $rootScope.$on PubNub.ngMsgEv($scope.controlChannel), (ngEvent, payload) ->
      $scope.$apply -> $scope.channels.push payload.message if $scope.channels.indexOf(payload.message) < 0

    ### Get a reasonable historical backlog of messages to populate the channels list ###
    PubNub.ngHistory { channel: $scope.controlChannel, count:500 }

    ### and finally, create and/or enter the 'WaitingRoom' channel ###
    if $scope.data?.super
      $scope.newChannel = 'WaitingRoom'
      $scope.createChannel()
    else
      $scope.subscribe 'WaitingRoom'
