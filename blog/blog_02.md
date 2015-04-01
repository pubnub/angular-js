# Next Steps: Presence & Message History with the PubNub AngularJS Library

A couple weeks ago, we posted our [using PubNub with AngularJS SDK for Real-time](http://www.pubnub.com/blog/real-time-angularjs-sdk-for-developers/)
which is a fast-growing and highly productive library
for web application development in JavaScript. Since then, there has been no
slowing down in the adoption or development of AngularJS or PubNub: AngularJS
recently released 1.2.10, and PubNub is up to version 3.5.48.

As we've been building a bunch of PubNub-enabled AngularJS applications,
a number of useful patterns and techniques for AngularJS developers have
popped up, for example:

* an Angular service to inject the data sync PubNub connector into controllers
* an Angular-friendly mechanism for binding events to the root scope
* additional bookkeeping functions for providing easy access to collections (such as the presence and channels lists)

We're continuously updating this library - for example, updated presence API
support will be coming soon. We're also actively exploring more features in this library,
such as PubNub-enabled Angular directives and integration with the AngularJS promise
framework. So stay tuned and let us know here [PubNub AngularJS on GitHub](https://github.com/pubnub/angular-js/issues) if you have any ideas for future enhancements!

The PubNub AngularJS library should look familiar to experienced
developers in Angular app development as well as to folks who have explored
the PubNub API a bit. For this blog entry, we'll presume you are somewhat
familiar with the ideas from [an earlier PubNub AngularJS SDK Blog](http://www.pubnub.com/blog/real-time-angularjs-sdk-for-developers/),
at least enough to get started. If you like what you see here, you can jump
right into a live version of the app at http://pubnub.github.io/angular-js/#/chat
or the source code at https://github.com/pubnub/angular-js/ .

Let's take a look at the contents of http://pubnub.github.io/angular-js/index.html ,
the main entry point for the application.

# Quick Recap: Setting Up

Here are the script includes you'll need to get started:

    <script src="http://cdn.pubnub.com/pubnub.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"></script>
    <script src="http://pubnub.github.io/angular-js/scripts/pubnub-angular.js"></script>

The web app is Angular-enabled with an ng-app attribute:

    <body ng-app="PubNubAngularApp">

The code for our app lives in:

    <script src="http://pubnub.github.io/angular-js/scripts/app.js"></script>

The app requires a dependency on the PubNub Angular library
(pubnub.angular.service, defined in pubnub-angular.js):

    angular.module('PubNubAngularApp', ["pubnub.angular.service"])

The code for our controllers lives in:

    <script src="http://pubnub.github.io/angular-js/scripts/controllers/main.js"></script>

Once that's set, the PubNub service can be injected into the controller by name!

    .controller('JoinCtrl', function($scope, PubNub) { ... });


# Quick Recap: Publish & Subscribe

Publishing to channels is trivial - just use the `PubNub.ngPublish()` method.

    $scope.publish = function() {
      PubNub.ngPublish({
        channel: $scope.selectedChannel,
        message: $scope.newMessage
      });
    };

Subscribing to channels is accomplished by calling the `PubNub.ngSubscribe()` method. After the
channel is subscribed, the app can register root scope message events by calling `$rootScope.$on`
with the "event name" string returned by `PubNub.ngMsgEv(channel)`.

    $scope.subscribe = function() {
      ...
      PubNub.ngSubscribe({ channel: theChannel });
      ...
      $rootScope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) {
        // payload contains message, channel, env...
        console.log('got a message event:', payload);    
      });
    }


# Wiring Up Presence Events into your Application

The PubNub Presence API makes it very easy to build presence-aware applications -- without
the Presence API, you'd have to track all of the join/leave/timeout events yourself on the
server side. Which is really tough if you're building a pure JS web application with no
server side!  Presence fixes that.

To keep things simple, wiring up Presence events using the PubNub AngularJS API is very
similar to wiring up Message events. It all boils down to registering an event handler
callback for the presence events:

```javascript
  PubNub.ngSubscribe({ channel: theChannel });
  ...
  $rootScope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
    // event is AngularJS event, payload contains PubNub Presence event
    console.log('got a presence event:', payload);    
  });
  ...
  PubNub.ngHereNow({ channel: theChannel });
```

In this case, `PubNub.ngPrsEv(theChannel)` returns the "event name" string that identifies
presence events for the specified channel.

The presence event payload contains a bunch of useful information for
your app: the channel and PubNub event itself. In the case of a single-user event (which you
can tell by the presence of the 'uuid' field, `payload.event` contains action (join/leave/timeout),
occupancy (number of users in the channel), timestamp, and uuid of the relevant user.

In the case of a multi-user event (such as the one triggered by `ngHereNow()`), the
`payload.event` contains the occupancy count as well as a 'uuids' field (note pluralization)
which contains the list of current user ids.

In addition to the callback-based API, there is also a convenient collection-based API
that keeps track of channel membership automatically. To obtain the list of users, just call
the `ngListPresence()` function with the name of the channel you'd like to list. Of course,
you'll want to already be subscribed to the channel and initialized the 'here now' status
as in the example below.

```javascript
  PubNub.ngSubscribe({ channel: theChannel });
  PubNub.ngHereNow({ channel: theChannel });
  ...
  allTheUsers = PubNub.ngListPresence(theChannel);
```

Often times, we combine both approaches to make sure that our Angular views always have
the most up-to-date user list:

```javascript
  PubNub.ngSubscribe({ channel: theChannel });
  PubNub.ngHereNow({ channel: theChannel });
  ...
  $rootScope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
    $scope.userList = PubNub.ngListPresence(theChannel);
  });
```

And just like that, your app is wired for presence!

# Using the History Functions to Backfill Messages

In addition to presence, the PubNub AngularJS API includes some helpers for building
realtime message-based applications. One convenient feature we'd like to point
out is the History API, which allows applications to retrieve previous messages from
PubNub channel storage and fire them as application message events.

The history API will require a channel subscription and message event handler as
shown below. Once that's set up, simply call the `ngHistory()` function with the number
of messages to retrieve.

```javascript
  PubNub.ngSubscribe({ channel: theChannel });
  ...
  $rootScope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) {
    // payload contains message, channel, env...
    console.log('got a message event:', payload);    
  });
  ...
  PubNub.ngHistory({ channel: theChannel, count: 500 });
```

When the `ngHistory()` call executes, the library will cause AngularJS message events
to be broadcast on the root scope to all registered listeners.

Check out the [PubNub Javascript SDK](http://www.pubnub.com/docs/javascript/javascript-sdk.html) for a
more detailed description of the History API v2 features. In addition to the 'count'
parameter above, it is also possible to do forward and reverse timeline-based
iteration! Look up the 'start', 'end' and 'reverse' parameters for details.

# Wrapping Up

In this blog entry, we had fun showing you a how to integrate your
angular app with the PubNub AngularJS library. We hope you find this information
to be useful -- it is really cool to see the number of PubNub and AngularJS
applications growing over the past few weeks!

The PubNub API has many more features we didn't cover in this blog
post, but which are explained in detail in the [GitHub API Guide and Reference](http://pubnub.github.io/angular-js/index.html). The documentation
walks you through additional topics which really enhance your real-time-enabled
web application.

In future blog posts, we'll cover other features of the PubNub Angular API.
In the meantime, please give the AngularJS integration a try, have fun,
and reach out if you have ideas visit [GitHub pubnub/angular-js](https://github.com/pubnub/angular-js/issues).
Or, do you need a hand [(help@pubnub.com)](mailto:help@pubnub.com)!


