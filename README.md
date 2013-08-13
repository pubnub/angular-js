Angular-JS and PubNub
=========================
The Angular.js PubNub library. Sign up now at http://pubnub.com

PubNub provides developers with the most scalable solution for
high-performance publish-subscribe messaging across global distances
and the largest audience sizes. Angular.js provides developers with
a powerful and easy-to-use framework for web application development.
Combine the two, and you get a powerful combination for communication,
entertainment, and enterprise collaboration, replication and
synchronization - Angular.js takes care of the event handling and DOM
updates, and leverages PubNub's global network to provide scalable
message delivery.

In this version, the Angular.js PubNub library provides access to the
PUBNUB object within Angular controllers, avoiding access via a global
variable. In the next rounds of development, we will be extending the
library with more Angular-specific capabilities like root scope integration,
native message broadcast events, and tie-ins with PubNub history and
presence APIs.

For more information, the PubNub JS library and specification docs are
available here:

* https://github.com/pubnub/pubnub-api/blob/master/README.md
* https://github.com/pubnub/javascript

This library is in the experimental phase - your feedback is most welcome!

Please share your ideas and use cases for future releases of the library - we
welcome contributions, pull requests and issue reports.

Questions, Feedback and Support and are always available through the
forums at https://help.pubnub.com/forums or email to help@pubnub.com .


# What's in the Sample Application

This sample application demonstrates a multi-channel chat room application
that takes advantage of PubNub's high-performance, high-availability network
for real-time communication. Multi-channel operation is extremely efficient
thanks to multiplexing support in the PubNub client library. This means that
the client library doesn't have to open 7 TCP connections so it can participate
in 7 broadcast channels - the server and client library takes care of combining
and separating messages on a single channel. This is especially useful for
power-conservation on mobile devices.


# Running the Sample App

1. git clone the app
1. cd angular-pubnub-app
1. npm install
1. bower install
1. grunt server
1. navigate browser to 'http://localhost:9000/'


# Using the Sample App

* Send messages to a channel using the message box
* Add new chat room 'channels' using the channels box
* Select a different channel by clicking the label


# Under the Hood of the Sample App

The HTML page includes 3 key libraries:

* The core PubNub JS Library (generally from the CDN)
* Angular.JS (usually as a Bower component)
* PubNub Angular (copy & paste for now - bower component coming soon)

The HTML code looks like this:

    <script src="http://cdn.pubnub.com/pubnub-3.5.3.js"></script>
    <script src="components/angular/angular.js"></script>
    <script src="scripts/pubnub-angular.js"></script>


The app is Angular-enabled with an ng-app attribute:

    <body ng-app="PubNubAngularApp">
    
Where 'PubNubAngularApp' is the name of the Angular module containing our app.

The code for the app lives in:

    <script src="scripts/app.js"></script>

Notice the dependency on the PubNub Angular library (pubnub.angular.service):

    angular.module('PubNubAngularApp', ["pubnub.angular.service"])

The code for the controllers lives in:

    <script src="scripts/controllers/main.js"></script>

The PubNub service is injected into the controller:

    .controller('MainCtrl', function($scope, PubNub) { ... });

Subscribing to channels is accomplished by calling the PubNub subscribe method:

    $scope.subscribe = function() {
      ...
      PubNub.subscribe({
        channel: $scope.channels.join(","),
        message: function (message, env, channel) {
          $scope.$apply () -> $scope.messages.unshift "#{channel} -> #{message}";
        });

There are two important things to note:

* We subscribe to multiple channels using a comma-delimited list
* The message callback appends incoming messages to a messages array in the scope


Publishing to channels is even easier:

    $scope.publish = function() {
      PubNub.publish({
        channel: $scope.selectedChannel,
        message: $scope.newMessage
      });
    };

Here, we call the PubNub publish method passing in the selected channel
and the message to transmit. It is also possible to transmit structured
data as JSON objects.

This is the core of the PubNub API - allowing clients to subscribe and
publish to topics, and have those events propagate in real-time to other
applications connected to the same channels.


# Next Steps

The PubNub API offers a variety of functionality beyond just multi-channel
publish and subscribe, including:

* Presence
* History Storage/Playback
* Platform features like SSL, Multi-Region Replication and Real-Time Analytics


