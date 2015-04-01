# In Control: Access Management using the PubNub AngularJS Library

In the course of implementing a bunch of new applications with the
PubNub AngularJS library, we found that it's often useful to be able
to restrict access to data and operations in the PubNub API. For
example, creating a private channel for a subset of users, creating
a read-only channel for real-time price updates, or restricting to
write-only access to implement the request channel for a request-response
interaction.

To that end, we added support for PAM (PubNub Access Manager) to the
PubNub AngularJS SDK. It allows flexible access control for just about
any use case one can come up with, in most cases using a completely
serverless API.

To refresh your memory, let's take a quick look at how we get started
using the AngularJS API. For a deeper understanding, feel free to check
out the [earlier PubNub AngularJS SDK Blog](http://www.pubnub.com/blog/real-time-angularjs-sdk-for-developers/).

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

# Getting In Control : Managing Access using PAM

There are three main functions in PAM: Grant (which allows or disallows
access to a specified channel given specified credentials), and Audit
(which shows the current access control settings).

The basic mechanism of access is the ```auth_key```, which acts as a shared
secret providing access. If auth_key is not specified in grant or revoke,
the operation applies to all users. The auth_key should be distributed to
users via a secure mechanism (via a private channel, or user-specific
messages from the server).

Granting read-only access to all channels for all users looks like:

```javascript
   PubNub.ngGrant({
    read: true
   });
```

Granting read-only access to a specific channel for all users looks like:

```javascript
   PubNub.ngGrant({
    channel: theChannel,
    read: true
   });
```

Granting read-only access to a specific channel is as simple as:

```javascript
    PubNub.ngGrant({
      channel: theChannel,
      auth_key: 'abc123',
      read: true,
      write: false
    });
```

To create a read-write credential, we do the following:

```javascript
    PubNub.ngGrant({
      channel: theChannel,
      auth_key: 'xyz978',
      read: true,
      write: true
    });
```

Note that we used a different auth_key for read/write so that
we can restrict distribution of that key to a limited subset
of users.

To revoke access, we use the PubNub.ngGrant() call with all
privileges disabled:

```javascript
    PubNub.ngGrant({
      channel: theChannel,
      read: false,
      write: false,
      auth_key: 'xyz978'
    });
```

To view permissions for a given channel and auth_key, we
use the PubNub.ngAudit() call and provide a callback:

```javascript
    PubNub.ngAudit({
      channel: theChannel,
      auth_key: 'xyz978',
      callback: function(data) {...}
    });
```

# Special Note: TTL's and Access Control

One noteworthy item we'd like to mention is that access
control is implemented using a TTL and expires with a
default of 24 hours. If you would like your permissions
to be permanent or have a different TTL value, please specify
it as follows:

```javascript
    PubNub.ngGrant({
      channel: theChannel,
      auth_key: 'xyz978',
      read: false,
      write: false,
      ttl: 3600
    });
```

This specifies a timeout of one hour. For more information,
check out the [JavaScript API](http://www.pubnub.com/docs/javascript/api/reference.html#grant).


# Special Note: Access Control and Presence

If your app uses presence, you'll need to grant access
to the special "ChannelName-pnpres" channel in order to
allow access to presence events. For example:

```javascript
    PubNub.ngGrant({
      channel:theChannel + "-pnpres",
      auth_key: 'xyz978',
      read:true,
      write:false,
      callback:function(){console.log(theChannel + ' presence all set', arguments);}
    });
```


# Putting It All Together

We've integrated access control into the PubNub AngularJS sample
application. When a user logs in, they are provided with a checkbox
asking "log in as super user?". Note - this is just for demonstration
purposes - in a real-world scenario, the server would likely determine
whether a user is a super user or not.

The code referenced below is available at:

https://github.com/pubnub/angular-js/blob/master/dist/scripts/controllers/main.js

When a user logs in with super user privileges, the secret key and
auth key are populated in the PubNub.init() call as follows:

```javascript
    $rootScope.secretKey = $scope.data.super ? '...' : null;
    $rootScope.authKey   = $scope.data.super ? 'ChooseABetterSecret' : null;

    PubNub.init({
      subscribe_key : '...',
      publish_key   : '...',
      # WARNING: DEMO purposes only, never provide secret key in a real web application!
      secret_key    : $rootScope.secretKey,
      auth_key      : $rootScope.authKey,
      uuid          : $rootScope.data.uuid,
      ssl           : true
    })
```

The grants are set up in the following lines of the application:

```javascript
    if ($scope.data.super) {
      // Grant access to the SuperHeroes room for supers only! 
      PubNub.ngGrant({channel:'SuperHeroes',auth_key:$rootScope.authKey,read:true,write:true,callback:function(){console.log('SuperHeroes! all set', arguments);}});
      PubNub.ngGrant({channel:"SuperHeroes-pnpres",auth_key:$rootScope.authKey,read:true,write:false,callback:function(){console.log('SuperHeroes! presence all set', arguments);}});
      // Let everyone see the control channel so they can retrieve the rooms list
      PubNub.ngGrant({channel:'__controlchannel',read:true,write:true,callback:function(){console.log('control channel all set', arguments)}});
      PubNub.ngGrant({channel:'__controlchannel-pnpres',read:true,write:false,callback:function(){console.log('control channel presence all set', arguments)}});
    }
```

And that's it! We now have a private channel called "SuperHeroes" which
is only visible if the client has access.


# Wrapping Up

In this blog entry, we had fun showing you a how to control access to your
angular app with the PubNub AngularJS library. We hope you find this information
to be useful -- it is really cool to see the number of PubNub and AngularJS
applications continue to grow over the past few weeks!

We're continuously updating this library - for example, updated presence API
support just recently landed in the SDK. We're also actively exploring more
features in this library, such as PubNub-enabled Angular directives and
integration with the AngularJS promise framework. So stay tuned and let us
know here [PubNub AngularJS on GitHub](https://github.com/pubnub/angular-js/issues) if you have any ideas for future enhancements!

In future blog posts, we'll cover even more features of the PubNub Angular API.
In the meantime, please give the AngularJS integration a try, have fun,
and reach out if you have ideas visit [GitHub pubnub/angular-js](https://github.com/pubnub/angular-js/issues).
Or, if you need a hand [(help@pubnub.com)](mailto:help@pubnub.com)!

