Angular-JS and PubNub
=========================
The Angular.js PubNub library.

This library is in the experimental phase - your feedback is most welcome!

Please share your ideas and use cases for future releases of the library.

# What's in the Sample Application

The sample application demonstrates a multi-channel chat room application
that takes advantage of PubNub's high-performance, high-availability network
for real-time communcation. Multi-channel operation is extremely efficient
thanks to multiplexing support in the PubNub client library.


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

# Next Steps

The PubNub API offers a variety of functionality beyond just multi-channel
publish and subscribe, including:

* Presence
* History Storage/Playback
* Platform features like SSL, Multi-Region Replication and Real-Time Analytics


