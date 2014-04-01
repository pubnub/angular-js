# AngularJS 101: From Zero to Angular in PubNub Seconds

Translation: "How to get a real-time app working with PubNub
and AngularJS in 60 seconds or less".

Here at PubNub, we're huge fans of AngularJS - in the short
time it's been around, it has amassed a huge following and
changed the way we build Web Applications.

We thought it would be kind of cool to put together the smallest
possible (but still interesting) sample application showcasing
PubNub and AngularJS.

The result is a sample application that fits into 99 lines
of HTML, of which less than 60 is JavaScript. If you're used
to coding your JavaScript in CoffeeScript, you can expect
that to easily get cut in half.

The source for the example lives here:

https://github.com/pubnub/angular-js/blob/master/app/mini.html

We'll walk you through the HTML section by section.


# Step 1: Get Your Includes On

To get started, we'll need to set up the script includes for
PubNub and Angular, as well as an optional stylesheet for
Bootstrap styles.

```html
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

Once these are all set, you're good to start coding!


# Step 2: Set Up Your HTML Layout and Dynamic Content

Let's get the HTML set up:

```html
<div class="container" ng-app="PubNubAngularApp" ng-controller="ChatCtrl">
```

AngularJS needs to be able to find your app. To make that happen,
we add an 'ng-app' attribute to the div element we want to
Angular-ize. In addition, we need to specify an AngularJS controller
function that takes care of binding all the logic we need. If you
look in the script tag at the end of the page, you'll see where we
set up the ChatCtrl function.

```html
<h4>Online Users</h4>
<ul>
  <li ng-repeat="user in users">{{user}}</li>
</ul>
```

Wow, how awesome is that? We can create a dynamic list of users
simply by using a ```ul``` element and an ```li``` element that's
set up to iterate over all of the items in $scope.users. For the
purposes of this demo, each user object is a simple string.

```html
<h4>Chat History {{messages.length}}</h4>
```

Just a header. Nothing to see here. One thing that's kind of nifty is
that we substitute in the length attribute from the $scope.messages
array.

```html
<form ng-submit='publish()'>
  <input type="text" ng-model='newMessage' />
  <input type="submit" value="Send" />
</form>
```

This is the first interactive feature - a simple text box
that binds its content to ```$scope.newMessage```, and a
submit button for the form. The form submit function is
bound to the ```$scope.publish``` function. What does it
do? We'll find out soon!

```html
<div class="well">
<ul><li ng-repeat="message in messages">{{message}}</li></ul>
</div>
```

Now that you're already an AngularJS and PubNub expert, you
can see that this is just a dynamic collection of messages
from the ```$scope.messages``` object.

Not too shabby! But you may ask, how does it all work? Let's
check out the JavaScript!


# Step 3: JavaScript - Where the Magic Happens

Let's walk through the JavaScript and see how it's all put
together.

```javascript
<script>
angular.module('PubNubAngularApp', ["pubnub.angular.service"])
.controller('ChatCtrl', function($rootScope, $scope, $location, PubNub) {
  ...
```

We create a normal ```script``` tag in the body - that''s
easy enough. 

The next part is defining the AngularJS module where all of
this lives. You may remember the PubNubAngularApp from the
HTML div tag we talked about earlier. We also declare an
Angular dependency on the ```pubnub.angular.service```, that
comes in because we already included the ```pubnub-angular.js```
file at the beginning of the HTML document.

The ```controller``` function call defines the AngularJS
controller - that''s the place where all of the data and
functions for our application will live. Notice that we''re
injecting the PubNub service into our controller - that''s
how we get access to all of the Real-Time goodness that
PubNub provides.

Let''s take a look at the body of the controller function:

```javascript
  // make up a user id (you probably already have this)
  $scope.userId   = "User " + Math.round(Math.random() * 1000);
  // make up a channel name
  $scope.channel  = 'The Angular Channel';
  // pre-populate any existing messages (just an AngularJS scope object)
  $scope.messages = ['Welcome to ' + $scope.channel];
```

These are pretty self-explanatory - just settings up variables
we''ll use for the applciation.


```javascript
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

It''s important to initialize the PubNub only once during
the course of the application. In this case, we use a variable
```initialized``` in the root scope to keep track of whether
we''ve initialized the PubNub service. The UUID is the globally
unique user ID you''d like to use for identifying the user.

```javascript
  // Subscribe to the Channel
  PubNub.ngSubscribe({ channel: $scope.channel });
```

I bet you can''t tell what that does! You''re right - it
calls the ```ngSubscribe``` function which creates a
new channel subscription for our app. The channel name
is specified in the variables above. It''s also possible
to subscribe to multiple channels, and PubNub does all the
work to make it easy.

Ok, now that we''ve subscribed, how does our app know about
messages coming in?

```javascript
  // Register for message events
  $rootScope.$on(PubNub.ngMsgEv($scope.channel), function(ngEvent, payload) {
    $scope.$apply(function() {
      $scope.messages.push(payload.message);
    });
  });
```

Here we bind an event handler to listen for message events.
The PubNub AngularJS library receives all of those events
coming from the channel and transforms them into Angular
events. Here we''re saying that when a message comes in,
push it into the ```$scope.messages``` collection. Since
it''s not easy for Angular to detect an ```Array.push()```
call, we wrap that little ditty in a ```$scope.apply```
call to make sure that Angular updates the view properly.

```javascript
  // Register for presence events (optional)
  $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
    $scope.$apply(function() {
      $scope.users = PubNub.ngListPresence($scope.channel);
    });
  });
```

If you''d like your app to display contents of the dynamic
user list, we try to keep it easy with the AngularJS
library. In the code snippet above, we register an
event listener for presence events that will update the
```$scope.users``` collection with the user list that
the AngularJS library is keeping track of for us. This
applies to join and leave events. Pretty nifty!

```javascript
  // Pre-Populate the user list (optional)
  PubNub.ngHereNow({
    channel: $scope.channel
  });
```

If you''d like to bring in the user list, just
add the call above - it''ll fire off a presence
event, which will be handled by the presence
handler we registered above using ```$rootScope.$on(PubNub.ngPrsEv($scope.channel) ...```.

```javascript
  // Populate message history (optional)
  PubNub.ngHistory({
    channel: $scope.channel,
    count: 500
  });
```

If you''d like to bring in message history, just
add the call above - it''ll fire all of the message
events, which will be handled by the event handler
we registered above using ```$rootScope.$on(PubNub.ngMsgEv($scope.channel) ...```.


```javascript
});
</script>
```

... And we're done! We hope you found this useful,
please keep in touch and reach out if you have any
issues!
