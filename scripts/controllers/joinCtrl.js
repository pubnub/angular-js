angular.module('PubNubAngularApp').controller('JoinCtrl', function ($rootScope, $scope, $location, Pubnub) {
    "use strict";

    var config = {
        publish_key: 'pub-c-e2b65946-31f0-4941-a1b8-45bab0032dd8',
        subscribe_key: 'sub-c-d66562f0-62b0-11e3-b12d-02ee2ddab7fe',
        secret_key: 'sec-c-MmIzMDAzNDMtODgxZC00YzM3LTk1NTQtMzc4NWQ1NmZhYjIy'
    };

    $rootScope.initialized = false;

    $scope.data = {
        username: 'Anonymous ' + Math.floor(Math.random() * 1000)
    };

    $scope.join = function () {
        $rootScope.data || ($rootScope.data = {});
        $scope.data || ($scope.data = {});

        $rootScope.data.username = $scope.data.username;
        $rootScope.data.city = $scope.city;
        $rootScope.data.super = $scope.super;
        $rootScope.data.uuid = Math.floor(Math.random() * 1000000) + '__' + $scope.data.username;
        $rootScope.secretKey = $scope.data.super ? config.secret_key : null;
        $rootScope.authKey = $scope.data.super ? 'ChooseABetterSecret' : null;

        initializePubnubWrapper();

        if ($scope.data.super) {
            grantSuperHeroesRoom();
        } else {
            $location.path('/chat');
        }
    };

    function initializePubnubWrapper () {
        Pubnub.init({
            subscribe_key: config.subscribe_key,
            publish_key: config.publish_key,
            secret_key: $rootScope.secretKey,
            auth_key: $rootScope.authKey,
            uuid: $rootScope.data.uuid,
            ssl: true
        });

        $rootScope.initialized = true;
    }

    /**
     * Grant access to the SuperHeroes room for supers only!
     */
    function grantSuperHeroesRoom () {
        Pubnub.grant({
            channel: 'SuperHeroes',
            auth_key: $rootScope.authKey,
            read: true,
            write: true,
            callback: function () {
                console.log('SuperHeroes! all set', arguments);

                Pubnub.grant({
                    channel: "SuperHeroes-pnpres",
                    auth_key: $rootScope.authKey,
                    read: true,
                    write: false,
                    callback: function () {
                        console.log('SuperHeroes! presence all set', arguments);

                        Pubnub.grant({
                            channel: '__controlchannel',
                            read: true,
                            write: true,
                            callback: function () {
                                console.log('control channel all set', arguments);

                                Pubnub.grant({
                                    channel: '__controlchannel-pnpres',
                                    read: true,
                                    write: false,
                                    callback: function () {
                                        console.log('control channel presence all set', arguments);

                                        $location.path('/chat');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});
