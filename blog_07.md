# Zero to Angular in Seconds - Multiplexing Edition

Welcome back to our blog series about how to get started quickly with
AngularJS using the PubNub AngularJS library. In a [recent episode](http://www.pubnub.com/blog/angularjs-101-from-zero-to-angular-in-seconds/),
we covered a tiny but powerful example of how to get started with
a real-time Angular Chat application in less than 100 lines of code.

The code for this example is available here:

* https://github.com/pubnub/angular-js/blob/master/app/multi.html

In _this_ installment we're looking at Multiplexing in PubNub, which
lets your app leverage multiple Publish/Subscribe channels in the
same application. The advantage of multiplexing in PubNub is that it
allows your app to use a single socket for all channel communications,
which is much more efficient than maintaining a connection per channel
(especially on mobile devices). Thanks to the magic of Angular, it's
super easy to make this happen with minimal code tweaks!

First off, let's take a look at the situations where you might take
advantage of Multiplexing:

* You're using one channel per Stock in a [stock-updates app](http://rtstock.co/)
* You have a "livecast" or "second screen" app, and would like to break out group chat into a different channel (for example, to reduce noise and/or restrict publish access permissions)
* You'd like to have separate channels for "in-app" notifications versus user-to-user communications
* In a game or collaboration app, you'd like to have a channel per "space", and allow users to participate in multiple areas

So, now that you know you want to try out multiplexing, how do you
do it? It's pretty easy with the PubNub angular application.

# Step 1: Get Your Includes On

Setup of the PubNub Angular library is exactly the same as with the original Zero-to-Angular example:

```
<!doctype html>
<html>
<head>
<script src="https://cdn.pubnub.com/pubnub.min.js"></script>
<script src="https://cdn.pubnub.com/pubnub-crypto.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"></script>
<script src="//code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="http://pubnub.github.io/angular-js/scripts/pubnub-angular.js"></script>
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
</head>
<body>
```

What does all this stuff do?

* pubnub.min.js : the main PubNub communication library for JavaScript
* pubnub-crypto.min.js : encryption features in case you need to enable them someday
* angular.min.js : that AngularJS goodness we all know and love
* jquery-1.10.1.min.js : bring in some JQuery
* pubnub-angular.js : bring in the official PubNub SDK for AngularJS
* bootstrap.min.css : bring in the bootstrap styles

Once these are all set, you’re good to start coding!

# Step 2: Set Up Your HTML Layout and Dynamic Content

Setup of the content DIV is the same as with the original Zero-to-Angular example:

```
<div class="container" ng-app="PubNubAngularApp" ng-controller="ChatCtrl">
```

*Multiplexing Subscription UI*: In this example, we're letting users choose what channels
to subscribe to. In your case, you might have an automatic or application-driven logic that
decides channel subscriptions.

```
<h4>Channel Subscriptions</h4>

<input type="checkbox" ng-model="subscriptions.channel1" ng-click="updateSubscription('channel1')" /> Channel 1
<br />
<input type="checkbox" ng-model="subscriptions.channel2" ng-click="updateSubscription('channel2')" /> Channel 2
<br/>
```

The key things to note about this code are:

* With the ```ng-model="subscriptions.channel1"``` attribute, we're telling Angular to keep the $scope.subscriptions.channel1 variable updated with the checkbox checked status (and likewise for channel2)
* With the ```ng-click="updateSubscription('channel1')"``` attribute, we're telling Angular to call the $scope.updateSubscription() function with argument 'channel1' when the checkbox is clicked (and likewise for channel2)

So putting this all together, we keep track of the desired channel
subscription status with the ```ng-model```, and we trigger the
update action using ```ng-click```.

The experienced reader may ask: Why don't we use ```$scope.$watch```
instead of ```ng-click```? The reason is that with watches, Angular
doesn't pass the variable name of the thing that changed. With ng-click,
we can sneak that channel argument in there so we know exactly what
channel status changed.

*Multiplexing Publishing UI*: Now that we have the channel selection UI,
let's hook up the publishing UI. We use separate buttons - in your
application, you will probably have alternate logic for deciding the
target channel for your messages.

```
<h4>Message History</h4>

<form>
  <input type="text" ng-model='newMessage' />
  <button ng-click="publish('channel1')">Send to Channel 1</button>
  <button ng-click="publish('channel2')">Send to Channel 2</button>
</form>
```

The h4 tag is just a header. The *real* power lies in the button
```ng-click``` handlers. We pass in the channel name so our publish()
function knows where to route the new message. We'll get to that soon
when we look at the controller.

What's left? Not a lot! We'll close out this section with an easy one.

```
<div class="well">
<ul>
<li ng-repeat="message in messages">{{message}}</li>
</ul>
</div>

</div>
```

Just like in the original example, the HTML above just displays our messages
in a UL (unordered list) element.

# Step 3: JavaScript – Where the Magic Happens

Just like the previous blog entry, let's wrap up by taking a stroll through
the JavaScript to see what's happening. You'll recognize a bunch from last time:

```
angular.module('PubNubAngularApp', ["pubnub.angular.service"])
.controller('ChatCtrl', function($rootScope, $scope, $location, PubNub) {
  // make up a user id (you probably already have this)
  $scope.userId   = "User " + Math.round(Math.random() * 1000);
  // set up initial channel memberships
  $scope.subscriptions = { channel1 : true, channel2 : false };
  // pre-populate any existing messages (just an AngularJS scope object)
  $scope.messages = ['Welcome to Channel 1'];
```

Just like last time, we:

* Declare an Angular module that matches our ng-app declaration
* Declare a Controller that matches our ng-controller declaration
* Set up the user id as a random string (your app probably has its own logic for this)
* Set up a starting message

The one *difference* is:

* Instead of a single channel, we keep track of the two channel subscription status values using a JavaScript Hash

That's pretty cool. Let's see what we have next.

```
if (!$rootScope.initialized) {
  // Initialize the PubNub service
  PubNub.init({
    subscribe_key: 'demo',
    publish_key: 'demo',
    uuid:$scope.userId
  });
  $rootScope.initialized = true;
}
```

This is boring, but in a good way. The code is exactly the same as
our first installment. We just initialize PubNub if it hasn't
been already. You'll want to put in your own publish and subscribe
keys of course!

*Multiplexing Subscribe/Unsubscribe Actions*: OK, now we're getting
somewhere! Let's set up a function to handle the channel subscription
logic.

```
// Create a function to subscribe to a channel
$scope.subscribe = function(theChannel) {
  // Subscribe to the channel via PubNub
  PubNub.ngSubscribe({ channel: theChannel });

  // Register for message events
  $rootScope.$on(PubNub.ngMsgEv(theChannel), function(ngEvent, payload) {
    $scope.$apply(function() {
      $scope.messages.push(payload.message);
    });
  });
};
```

The important things about this code are:

* We use PubNub.ngSubscribe to register for event callbacks (note: only call it once per channel or you'll get duplicate message events!)
* We register for message events using the Angular native $rootScope.$on function
* The channel message events are named using a PubNub-Angular-specific string that we obtain using PubNub.ngMsgEv (which is shorthand for "Angular channel message event name")

Pretty sweet! Now, how do we unsubscribe?

```
// Create a function to unsubscribe from a channel
$scope.unsubscribe = function(theChannel) {
  // Unsubscribe from the channel via PubNub
  PubNub.ngUnsubscribe({ channel: theChannel });
};
```

We call the PubNub.ngUnsubscribe function, which even takes care of de-registering the event handler
for us. Not too hard at all!

*Multiplexing Publish Action*: This one is really simple - it's just a tiny bit
different from the single-channel example.

```
// Create a publish() function in the scope
$scope.publish = function(channel) {
  PubNub.ngPublish({
    channel: channel,
    message: "[" + $scope.userId + "@" + channel + "] " + $scope.newMessage
  });
  $scope.newMessage = '';
};
```

All we had to do was add a 'channel' argument to our publish
function. Since 'publish' doesn't require a 'subscribe', it's
really easy to fire off messages with PubNub!

The last part of our JavaScript code is writing a function that
knows whether to subscribe or unsubscribe, plus a bit of code
for setting up the initial channel subscriptions.

```
// Create a subscribe/unsubscribe click handler
$scope.updateSubscription = function(theChannel) {
  if ($scope.subscriptions[theChannel]) {
    $scope.subscribe(theChannel);
  } else {
    $scope.unsubscribe(theChannel);
  }
};

// Set up the initial channel subscriptions
$scope.updateSubscription('channel1');
$scope.updateSubscription('channel2');
```

So what we're doing in the first part is:

* Setting up a function in the scope that is called by the checkbox ng-click handler (so we know that an update is necessary)
* Calling our subscribe or unsubscribe function based on the desired channel subscription state (which was already updated through the ng-model mechanism)

And to bring things full circle, the last part just does a 1-time
set of the subscriptions when the controller loads! (Since we don't
have an update event because there was no user interaction yet.)

```
});
</script>
</body>
</html>
```

... And we're done! Hopefully this helped you get started with PubNub
channel multiplexing and AngularJS without much trouble. Please keep
in touch, and give us a yell if you run into any issues!

