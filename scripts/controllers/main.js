(function() {
  'use strict';
  /*
  The JoinCtrl is responsible for collecting the username and calling the PubNub.init() method
  when the "Join" button is clicked.
  */

  angular.module('PubNubAngularApp').controller('JoinCtrl', function($rootScope, $scope, $location, PubNub) {
    $scope.data = {
      username: 'Anonymous ' + Math.floor(Math.random() * 1000)
    };
    $scope.join = function() {
      var _ref;
      $rootScope.data || ($rootScope.data = {});
      $rootScope.data.username = (_ref = $scope.data) != null ? _ref.username : void 0;
      PubNub.init({
        subscribe_key: 'demo',
        publish_key: 'demo',
        uuid: Math.floor(Math.random() * 1000000) + '__' + $scope.data.username
      });
      return $location.path('/chat');
    };
    return $(".prettyprint");
  });

  /*
  The ChatCtrl is responsible for creating, displaying, subscribing to, and
  chatting in channels
  */


  angular.module('PubNubAngularApp').controller('ChatCtrl', function($rootScope, $scope, $location, PubNub) {
    if (!PubNub.initialized()) {
      $location.path('/join');
    }
    /* Use a "control channel" to collect channel creation messages*/

    $scope.controlChannel = '$control$channel';
    $scope.channels = [];
    /* Publish a chat message*/

    $scope.publish = function() {
      console.log('publish', $scope);
      PubNub.ngPublish({
        channel: $scope.selectedChannel,
        message: {
          text: $scope.newMessage,
          user: $scope.data.username
        }
      });
      return $scope.newMessage = '';
    };
    /* Create a new channel*/

    $scope.createChannel = function() {
      var channel;
      console.log('createChannel', $scope);
      if (!$scope.newChannel) {
        return;
      }
      channel = $scope.newChannel;
      $scope.newChannel = '';
      PubNub.ngPublish({
        channel: $scope.controlChannel,
        message: channel
      });
      return setTimeout(function() {
        $scope.subscribe(channel);
        return $scope.showCreate = false;
      }, 100);
    };
    /* Select a channel to display chat history & presence*/

    $scope.subscribe = function(channel) {
      console.log('subscribe', channel);
      if (channel === $scope.selectedChannel) {
        return;
      }
      if ($scope.selectedChannel) {
        PubNub.ngUnsubscribe({
          channel: $scope.selectedChannel
        });
      }
      $scope.selectedChannel = channel;
      $scope.messages = ['Welcome to ' + channel];
      PubNub.ngSubscribe({
        channel: $scope.selectedChannel
      });
      $rootScope.$on(PubNub.ngPrsEv($scope.selectedChannel), function(ngEvent, payload) {
        return $scope.$apply(function() {
          return $scope.users = PubNub.map(PubNub.ngListPresence($scope.selectedChannel), function(x) {
            return x.replace(/\w+__/, "");
          });
        });
      });
      PubNub.ngHereNow({
        channel: $scope.selectedChannel
      });
      $rootScope.$on(PubNub.ngMsgEv($scope.selectedChannel), function(ngEvent, payload) {
        var msg;
        msg = payload.message.user ? "[" + payload.message.user + "] " + payload.message.text : "[unknown] " + payload.message;
        return $scope.$apply(function() {
          return $scope.messages.unshift(msg);
        });
      });
      return PubNub.ngHistory({
        channel: $scope.selectedChannel,
        count: 500
      });
    };
    /* When controller initializes, subscribe to retrieve channels from "control channel"*/

    PubNub.ngSubscribe({
      channel: $scope.controlChannel
    });
    /* Register for channel creation message events*/

    $rootScope.$on(PubNub.ngMsgEv($scope.controlChannel), function(ngEvent, payload) {
      return $scope.$apply(function() {
        if ($scope.channels.indexOf(payload.message) < 0) {
          return $scope.channels.push(payload.message);
        }
      });
    });
    /* Get a reasonable historical backlog of messages to populate the channels list*/

    PubNub.ngHistory({
      channel: $scope.controlChannel,
      count: 500
    });
    /* and finally, enter the 'WaitingRoom' channel*/

    $scope.newChannel = 'WaitingRoom';
    return $scope.createChannel();
  });

}).call(this);
