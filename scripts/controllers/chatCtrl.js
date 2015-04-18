angular.module('PubNubAngularApp').controller('ChatCtrl', function ($rootScope, $scope, $location, Pubnub) {
    if (!$rootScope.initialized) {
        return $location.path('/join');
    }

    /* Use a "control channel" to collect channel creation messages*/
    $scope.controlChannel = '__controlchannel';
    $scope.channels = [];

    $scope.publish = function () {
        if (!$scope.selectedChannel) {
            return;
        }

        Pubnub.publish({
            channel: $scope.selectedChannel,
            message: {
                text: $scope.newMessage,
                user: $scope.data.username
            }
        });

        $scope.newMessage = '';
    };

    $scope.createChannel = function () {
        var channel;

        if (!($scope.data.super && $scope.newChannel)) {
            return;
        }

        channel = $scope.newChannel;
        $scope.newChannel = '';

        Pubnub.grant({
            channel: channel,
            read: true,
            write: true,
            callback: function () {
                console.log(channel + " all set", arguments);
                Pubnub.grant({
                    channel: channel + "-pnpres",
                    read: true,
                    write: false,
                    callback: function () {
                        console.log(channel + " presence all set", arguments);
                        Pubnub.publish({
                            channel: $scope.controlChannel,
                            message: channel,
                            callback: function () {
                                $scope.subscribe(channel);
                                $scope.showCreate = false;
                            }
                        });
                    }
                });
            }
        });
    };

    $scope.subscribe = function (channel) {
        if (channel === $scope.selectedChannel) {
            return;
        }

        var scheduledHereNowIntervalMs = 60000,
            presencePool = [];

        $scope.users = {};

        if ($scope.selectedChannel) {
            Pubnub.unsubscribe({
                channel: $scope.selectedChannel
            });
        }

        $scope.selectedChannel = channel;
        $scope.messages = ['Welcome to ' + channel];

        Pubnub.subscribe({
            channel: $scope.selectedChannel,
            auth_key: $scope.authKey,
            state: {
                city: $rootScope.data.city || 'unknown city',
                name: $scope.data.username
            },
            connect: function () {
                synchronizeUsers();
                setInterval(synchronizeUsers, scheduledHereNowIntervalMs);
            },
            triggerEvents: ['callback', 'presence']
        });

        function addToPresencePool (pnEvent) {
            presencePool.push(pnEvent);
        }

        function applyPresencePool () {
            if (presencePool === null) return;

            var l = presencePool.length,
                i;

            for (i = 0; i < l; i++) {
                applyEvent(presencePool[i]);
            }

            presencePool = null;
        }

        function applyEvent (pnEvent) {
            if ('data' in pnEvent) {
                switch (pnEvent.action) {
                    case 'join':
                        // fallback to previous version user naming
                        if ('data' in pnEvent && !('name' in pnEvent.data)) {
                            pnEvent.data.name = pnEvent.uuid.replace(/\w+__/, "");
                        }

                        $scope.$apply(function () {
                            $scope.users[pnEvent.uuid] = pnEvent.data;
                        });
                        break;
                    case 'leave':
                        $scope.$apply(function () {
                            delete $scope.users[pnEvent.uuid];
                        });
                        delete $scope.users[pnEvent.uuid];
                        break;
                    default:
                        break;
                }
            }
        }

        function synchronizeUsers () {
            Pubnub.here_now({
                channel: $scope.selectedChannel,
                state: true,
                callback: function (response) {
                    if (!('uuids' in response)) {
                        console.warn("There are not users on channel '" + $scope.selectedChannel + "'");
                        return;
                    }

                    var newUsersData = {},
                        length = response.uuids.length,
                        currentUser,
                        i;

                    for (i = 0; i < length; i++) {
                        currentUser = response.uuids[i];
                        newUsersData[currentUser.uuid] = currentUser.state;

                        // fallback to previous version user naming
                        if ('state' in currentUser && !('name' in currentUser.state)) {
                            newUsersData[currentUser.uuid]['name'] = currentUser.uuid.replace(/\w+__/, "");
                        }
                    }

                    $scope.$apply(function () {
                        $scope.users = newUsersData;
                    });

                    applyPresencePool();
                }
            });
        }

        $rootScope.$on(Pubnub.getPresenceEventNameFor($scope.selectedChannel), function (ngEvent, pnEvent, env, channel) {
            if (channel === $scope.selectedChannel) {
                if (presencePool === null) {
                    applyEvent(pnEvent);
                } else {
                    addToPresencePool(pnEvent);
                }
            }
        });

        function wrapMessage(message) {
            return message.user ? "[" + message.user + "] " + message.text : "[unknown] " + message;
        }

        $rootScope.$on(Pubnub.getMessageEventNameFor($scope.selectedChannel), function (ngEvent, message) {
            $scope.$apply(function () {
                $scope.messages.unshift(wrapMessage(message));
            });
        });

        Pubnub.history({
            channel: $scope.selectedChannel,
            auth_key: $scope.authKey,
            count: 500,
            reverse: false,
            callback: function (result) {
                var messages = result[0],
                    wrappedMessagesArray = [],
                    length = messages.length,
                    i;

                for (i = 0; i < length; i++) {
                    wrappedMessagesArray[i] = wrapMessage(messages[i]);
                }

                $scope.$apply(function () {
                    $scope.messages = wrappedMessagesArray.reverse();
                })
            }
        });
    };

    $scope.signOut = function () {
        Pubnub.unsubscribe({
            channel: $scope.channels,
            callback: function () {
                $location.path('/join');
            }
        });
    };

    Pubnub.subscribe({
        channel: $scope.controlChannel,
        triggerEvents: ['callback']
    });

    /* Get a reasonable historical backlog of messages to populate the channels list*/
    Pubnub.history({
        channel: $scope.controlChannel,
        count: 500,
        callback: function (response) {
            $scope.channels = _.uniq(response[0]);
        }
    });

    $rootScope.$on(Pubnub.getMessageEventNameFor($scope.controlChannel), function (ngEvent, payload) {
        $scope.$apply(function () {
            if ($scope.channels.indexOf(payload.message) < 0) {
                $scope.channels.push(payload.message);
            }
        });
    });

    /* and finally, create and/or enter the 'WaitingRoom' channel*/
    if (angular.isObject($scope.data) && $scope.data.super) {
        $scope.newChannel = 'WaitingRoom';
        $scope.createChannel();
    } else {
        $scope.subscribe('WaitingRoom');
    }
});
