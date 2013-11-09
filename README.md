Angular-JS and PubNub
=========================
This is an example of using Angular-JS with the PubNub library.
You can find out more about PubNub at http://pubnub.com

PubNub is a real-time network that helps developers build real-time apps
easily and scale them globally. Angular.js provides developers with
a powerful and easy-to-use framework for web application development.
Combine the two, and you get a powerful combination for communication,
entertainment, enterprise collaboration, replication and
synchronization - Angular.js takes care of the event handling and DOM
updates, and leverages PubNub's global network to provide scalable
message delivery.

In this *updated* version, the Angular.js PubNub library provides access to
a 'PubNub' object within Angular controllers, avoiding access via a global
variable for access to the PubNub core JavaScript API. In addition, this
extension provides developers with special Angular-specific capabilities such
as root scope integration, presence and channel lists, plus native message
broadcast events and tie-ins with PubNub history and presence APIs.

For more information about the PubNub API visit http://pubnub.com/developers

Please share your ideas and use cases for future releases of the library - we
welcome contributions, pull requests and issue reports.

Questions, Feedback and Support and are always available through the
forums at https://help.pubnub.com/forums or email to help@pubnub.com.


# What's in the Sample Application

This sample application demonstrates a multi-channel chat room application
that takes advantage of PubNub's easy to use API and globally scaled network.
Multi-channel operation is extremely efficient thanks to multiplexing support
in the PubNub client library. This means that the client library doesn't have
to open 7 TCP connections so it can participate in 7 broadcast channels - the
server and client library takes care of combining and separating messages on
a single channel. This is especially useful for power-conservation on mobile devices.

You can check out the sample application online at http://pubnub.github.io/angular-js/


# Running the Sample App

1. `git clone` the app
1. `cd angular-js`
1. `npm install`
1. `bower install`
1. `grunt server`
1. navigate browser to http://localhost:9000/


# Using the Sample App

* Send messages to a channel using the chat box
* Add new chat room channels using "create new" channels button
* Select a different channel by clicking the channel button


# Under the Hood of the Sample App

The HTML page includes 3 key libraries:

* The core PubNub JS Library (generally from the CDN)
* AngularJS (usually as a Bower component)
* PubNub Angular (copy & paste for now - bower component coming soon)

The HTML code looks like this:

```html
<script src="http://cdn.pubnub.com/pubnub-3.5.3.js"></script>
<script src="components/angular/angular.js"></script>
<script src="scripts/pubnub-angular.js"></script>
```

The app is Angular-enabled with an ng-app attribute:

```html
<body ng-app="PubNubAngularApp">
```
    
Where 'PubNubAngularApp' is the name of the Angular module containing our app.

The code for the app lives in:

```html
<script src="scripts/app.js"></script>
```

Notice the dependency on the PubNub Angular library (pubnub.angular.service):

```javascript
angular.module('PubNubAngularApp', ["pubnub.angular.service"])
```

The code for the controllers lives in:

```html
<script src="scripts/controllers/main.js"></script>
```

The PubNub service is injected into the controller:

```javascript
.controller('JoinCtrl', function($scope, PubNub) { ... });
```

# Using the Special AngularJS PubNub API

Publishing to channels is trivial:

```javascript
$scope.publish = function() {
  PubNub.ngPublish({
    channel: $scope.selectedChannel,
    message: $scope.newMessage
  });
};
```

Here, we call the PubNub publish method passing in the selected channel
and the message to transmit. It is also possible to transmit structured
data as JSON objects.

Subscribing to channels is accomplished by calling the PubNub ngSubscribe method.
After the channel is subscribed, the app can register root scope message events
by calling $rootScope.$on with the event string returned by PubNub.ngMsgEv(channel).

```javascript
$scope.subscribe = function() {
  ...
  PubNub.ngSubscribe({ channel: theChannel })
  ...
  $rootScope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) {
    // payload contains message, channel, env...
    console.log('got a message event:', payload);    
  })
  ...
  $rootScope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
    // payload contains message, channel, env...
    console.log('got a presence event:', payload);
  })
```

This is the core of the PubNub API - allowing clients to subscribe and
publish to channels, and have those events propagate in real-time to other
applications connected to the same channels.


# Integrating Presence Events

It's also easy to integrate presence events using the Angular API. In
the example above, we just add an additional couple lines of code to
call the PubNub.ngHereNow() method (retrieve current users), and register
for presence events by calling $rootScope.$on with the event string
returned by PubNub.ngPrsEv(channel).

```javascript
$scope.subscribe = function() {
  ...
  PubNub.ngSubscribe({ channel: theChannel })
  $rootScope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) { ... })
  ...
  $rootScope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
    // payload contains message, channel, env...
    console.log('got a presence event:', payload);
  })

  PubNub.ngHereNow { channel: theChannel }
```

Using the presence event as a trigger, we retrieve the Presence
list for a channel using the PubNub.ngListPresence() function.

```javascript
  $rootScope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
    $scope.users = PubNub.ngListPresence(theChannel);
  })
```


# Retrieving History

It can be super-handy to gather the previous several hundred messages
from the PubNub channel history. The PubNub Angular API makes this easy
by bridging the event model of the PubNub JS history API and the AngularJS
event broadcast model so that historical messages come through the same
event interface.

```javascript
  PubNub.ngHistory({channel:theChannel, count:500});
  // messages will be broadcast via $rootScope...
```


# Listing & Unsubscribing from Channels

The PubNub Angular API takes care of keeping track of currently subscribed
channels. Call the PubNub.ngListChannels() method to return a list of presently
subscribed channels.

```javascript
  $scope.channels = PubNub.ngListChannels()
```

Unsubscribing is as easy as calling the PubNub.ngUnsubscribe() method. The
library even takes care of removing the Angular event handlers for you to
prevent memory leaks!

```javascript
  PubNub.ngUnsubscribe({channel:theChannel})
```






# Next Steps

The PubNub API offers a variety of functionality beyond just multi-channel
publish and subscribe, including:

* Encryption
* Access Control & Permissions
* Analytics
