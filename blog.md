
# First Look: The PubNub AngularJS Library

Over the past few months, it has been really exciting to follow the
phenomenal traction and explosive adoption of AngularJS, an Open Source
framework for Web Application development, originally started by
developers at Google and now receiving global attention.

Over the course of building a few PubNub-enabled AngularJS applications,
we came across a bunch of patterns and features that we thought would
be useful for AngularJS developers, for example:

* an Angular service to inject the PubNub object into controllers
* an Angular-friendly mechanism for binding events to the root scope
* additional bookkeeping functions for providing easy access to collections
  (such as the presence and channels lists)

In the future, we're thinking about doing more in this area, such as
PubNub-enabled Angular directives,so stay tuned and let us know 
here (https://github.com/pubnub/angular-js/issues) if you have any
ideas for future enhancements!

The PubNub AngularJS library should look familiar to experienced
developers in Angular development as well as to folks who have explored
the PubNub API a bit. In this blog entry, we'll give you a quick preview
of what you need to get started. If you like what you see, you can jump
right into a live version of the app at http://pubnub.github.io/angular-js/#/chat or the
source code at https://github.com/pubnub/angular-js/ .

Let's take a look at the contents of http://pubnub.github.io/angular-js/index.html ,
the main entry point for the application.

# Setting Up

First off, here are the script includes you'll need to get started:

    <script src="http://cdn.pubnub.com/pubnub.min.js"></script>
    <script src="components/angular/angular.js"></script>
    <script src="scripts/pubnub-angular.js"></script>
  
Where `pubnub.min.js` is the "latest" PubNub API, `angular.js`
is your version of angular (we've used 1.0.8, and are starting to
play with the 1.2.x series), and `pubnub-angular.js` is our angular
library that you can copy and paste into your web application
(a bower component will be coming soon).

Our web app is Angular-enabled with an ng-app attribute:

    <body ng-app="PubNubAngularApp">

Where 'PubNubAngularApp' is the name of the Angular module containing our app.

The code for our app lives in:

    <script src="scripts/app.js"></script>

In app.js, notice the dependency on the PubNub Angular library
(pubnub.angular.service, defined in pubnub-angular.js):

    angular.module('PubNubAngularApp', ["pubnub.angular.service"])

The code for our controllers lives in:

    <script src="scripts/controllers/main.js"></script>

Once that's set, the PubNub service can be injected into the controller by name!

    .controller('JoinCtrl', function($scope, PubNub) { ... });

# Getting Started

Publishing to channels is trivial - just use the PubNub.ngPublish() method.

    $scope.publish = function() {
      PubNub.ngPublish({
        channel: $scope.selectedChannel,
        message: $scope.newMessage
      });
    };

As you can see, we call the PubNub publish method passing in the desired channel
and message to transmit. It is also possible to transmit structured data as JSON objects, so go wild!

It's not necessary to subscribe to a channel in order to publish to a channel.

Subscribing to channels is accomplished by calling the PubNub.ngSubscribe() method. After the
channel is subscribed, the app can register root scope message events by calling $rootScope.$on
with the event string returned by PubNub.ngMsgEv(channel).

    $scope.subscribe = function() {
      ...
      PubNub.ngSubscribe({ channel: theChannel })
      ...
      $rootScope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) {
        // payload contains message, channel, env...
        console.log('got a message event:', payload);    
      })
    }

This is the core of the PubNub API - allowing clients to subscribe and publish to channels,
and have those events propagate in real-time to other applications connected to the same channels.

# Diving Deeper

The PubNub API has many more features we didn't cover in this first blog
post, but which are explained in detail in the API Guide and Reference
here http://pubnub.github.io/angular-js/index.html . The documentation
walks you through topics like Presence and History which really enhance
your real-time-enabled web application.

In future blog posts, we'll cover other features of the PubNub Angular API.
In the meantime, please give the AngularJS integration a try, have fun,
and reach out if you have ideas (https://github.com/pubnub/angular-js/issues)
or need a hand (mailto:help@pubnub.com)!

