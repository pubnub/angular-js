// TODO: super user behaviour
angular.module('PubNubAngularApp').controller('JoinCtrl', function ($rootScope, $scope, $location, Pubnub) {
    "use strict";

    $rootScope.initialized = false;

    $scope.data = {
        username: 'Anonymous ' + Math.floor(Math.random() * 1000)
    };

    $scope.join = function () {
        var _ref, _ref1, _ref2;

        // TODO: simplify initialization
        $rootScope.data || ($rootScope.data = {});
        $rootScope.data.username = (_ref = $scope.data) != null ? _ref.username : void 0;
        $rootScope.data.city = (_ref1 = $scope.data) != null ? _ref1.city : void 0;
        $rootScope.data.super = (_ref2 = $scope.data) != null ? _ref2.super : void 0;
        $rootScope.data.uuid = Math.floor(Math.random() * 1000000) + '__' + $scope.data.username;
        $rootScope.secretKey = $scope.data["super"] ? 'sec-c-MmIzMDAzNDMtODgxZC00YzM3LTk1NTQtMzc4NWQ1NmZhYjIy' : null;
        $rootScope.authKey = $scope.data["super"] ? 'ChooseABetterSecret' : null;

        Pubnub.init({
            subscribe_key: 'sub-c-d66562f0-62b0-11e3-b12d-02ee2ddab7fe',
            publish_key: 'pub-c-e2b65946-31f0-4941-a1b8-45bab0032dd8',
            secret_key: $rootScope.secretKey,
            auth_key: $rootScope.authKey,
            uuid: $rootScope.data.uuid,
            ssl: true
        });

        $rootScope.initialized = true;

        if ($scope.data["super"]) {

            /* Grant access to the SuperHeroes room for supers only!*/
            Pubnub.grant({
                channel: 'SuperHeroes',
                auth_key: $rootScope.authKey,
                read: true,
                write: true,
                callback: function () {
                    return console.log('SuperHeroes! all set', arguments);
                }
            });

            Pubnub.grant({
                channel: "SuperHeroes-pnpres",
                auth_key: $rootScope.authKey,
                read: true,
                write: false,
                callback: function () {
                    return console.log('SuperHeroes! presence all set', arguments);
                }
            });

            Pubnub.grant({
                channel: '__controlchannel',
                read: true,
                write: true,
                callback: function () {
                    return console.log('control channel all set', arguments);
                }
            });

            Pubnub.grant({
                channel: '__controlchannel-pnpres',
                read: true,
                write: false,
                callback: function () {
                    return console.log('control channel presence all set', arguments);
                }
            });
        }

        $location.path('/chat');
    };
});

angular.module('PubNubAngularApp').controller('ChatCtrl', function ($rootScope, $scope, $location, Pubnub) {
    var _ref;

    if (!$rootScope.initialized) {
        $location.path('/join');
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
            }
        });

        Pubnub.grant({
            channel: channel + "-pnpres",
            read: true,
            write: false,
            callback: function () {
                console.log(channel + " presence all set", arguments);
            }
        });

        Pubnub.publish({
            channel: $scope.controlChannel,
            message: channel
        });

        setTimeout(function () {
            $scope.subscribe(channel);
            $scope.showCreate = false;
        }, 100);
    };

    /* Select a channel to display chat history & presence*/
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
            }
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

        $rootScope.$on(Pubnub.getPresenceEventNameFor($scope.selectedChannel), function (ngEvent, message) {
            var pnEvent = message[0],
                channel = message[2];

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

        $rootScope.$on(Pubnub.getMessageEventNameFor($scope.selectedChannel), function (ngEvent, payload) {
            $scope.$apply(function () {
                $scope.messages.unshift(wrapMessage(payload[0]));
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

    Pubnub.subscribe({
        channel: $scope.controlChannel,
        triggerEvent: true
    });

    $rootScope.$on(Pubnub.getMessageEventNameFor($scope.controlChannel), function (ngEvent, payload) {
        $scope.$apply(function () {
            if ($scope.channels.indexOf(payload.message) < 0) {
                $scope.channels.push(payload.message);
            }
        });
    });

    /* Get a reasonable historical backlog of messages to populate the channels list*/
    Pubnub.history({
        channel: $scope.controlChannel,
        count: 500,
        callback: function (response) {
            $scope.channels = _.uniq(response[0]);
        }
    });

    /* and finally, create and/or enter the 'WaitingRoom' channel*/
    if ((_ref = $scope.data) != null ? _ref["super"] : void 0) {
        $scope.newChannel = 'WaitingRoom';
        $scope.createChannel();
    } else {
        $scope.subscribe('WaitingRoom');
    }

    $scope.sign_out = function () {
        Pubnub.unsubscribe({
            channel: $scope.channels,
            callback: function () {
                $location.path('/join');
            }
        });
    };
});
