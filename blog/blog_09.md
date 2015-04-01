# Zero to Angular in Seconds - PubNub IS Compatible! (With the Latest and Greatest AngularJS Versions)

Welcome back, and thank you so much for checking out our blog series about
how to get started quickly with AngularJS using the PubNub AngularJS library!
In recent episodes, we covered a tiny but powerful example of how to create
a real-time Angular Chat application in less than
[100 lines of code](http://www.pubnub.com/blog/angularjs-101-from-zero-to-angular-in-seconds/),
as well as how to [extend the example with multiplexing](http://www.pubnub.com/blog/building-multiplexing-into-your-angularjs-application/).

You can see the full listing of blog entries [here](http://www.pubnub.com/blog/tag/angularjs-2/).

Don't run off just yet though! The code for today's examples are available here:

* https://github.com/pubnub/angular-js/tree/master/app/examples

In _this_ installment we're looking at how PubNub supports all of the major
AngularJS versions from the latest 1.3.0-beta.13 all the way back to 1.0.8.
We want to make sure it's as easy as possible for developers to get started
with AngularJS and PubNub, and then keep those applications humming even as
AngularJS releases newer and even more awesome versions!

You can always check out the latest AngularJS versions we're working with here:

* https://github.com/pubnub/angular-js/blob/master/app/examples/VERSIONS.md

Since compatibility is SO important, we've started providing versions of our
sample code that runs with the latest release of each major AngularJS version.
You can see those examples [here](https://github.com/pubnub/angular-js/tree/master/app/examples).

For example:

* Intro chat example ([v1.0.x](https://github.com/pubnub/angular-js/blob/master/app/examples/mini_1.0.x.html), [v1.1.x](https://github.com/pubnub/angular-js/blob/master/app/examples/mini_1.1.x.html), [v1.2.x](https://github.com/pubnub/angular-js/blob/master/app/examples/mini_1.2.x.html), [v1.3.x](https://github.com/pubnub/angular-js/blob/master/app/examples/mini_1.3.x.html))
* Multiplexing example ([v1.0.x](https://github.com/pubnub/angular-js/blob/master/app/examples/multi_1.0.x.html), [v1.1.x](https://github.com/pubnub/angular-js/blob/master/app/examples/multi_1.1.x.html), [v.1.2.x](https://github.com/pubnub/angular-js/blob/master/app/examples/multi_1.2.x.html), [v1.3.x](https://github.com/pubnub/angular-js/blob/master/app/examples/multi_1.3.x.html))
* Crypto example ([v1.0.x](https://github.com/pubnub/angular-js/blob/master/app/examples/crypto_1.0.x.html), [v1.1.x](https://github.com/pubnub/angular-js/blob/master/app/examples/crypto_1.1.x.html), [v.1.2.x](https://github.com/pubnub/angular-js/blob/master/app/examples/crypto_1.2.x.html), [v1.3.x](https://github.com/pubnub/angular-js/blob/master/app/examples/crypto_1.3.x.html))

If you look at each example, you'll notice one amazing thing - there are no
differences in the app code except for the Angular version in the AngularJS
SCRIPT tag include! That's the point - we want to make sure that your application
can transition to new Angular versions as seamlessly as possible.

Behind the scenes, here's a synopsis of what has changed in major *AngularJS* releases:

* *1.0* : AngularJS makes its prime time debut! (welcome $route, $compile, $location, $http, $timeout, $injector, etc etc!);
* *1.1* : Improved error handling, animations and transitions, focus/blur events (YES!); [notes here](http://blog.angularjs.org/2012/07/angularjs-10-12-roadmap.html)
* *1.2* : Security improvements, rewrite animations/transitions, better mobile support, better SVG support, promise A+ compliance; [notes here](http://blog.angularjs.org/2013/11/angularjs-120-timely-delivery.html)
* *1.3* : Security improvements, improved mobile support, improved SVG and MathML handling, validators pipeline, remove auto promise unwrapping, improved testability discontinue IE support (YAY! *sob*); [notes here](https://github.com/angular/angular.js/blob/master/CHANGELOG.md#130-beta12-ephemeral-acceleration-2014-06-13)

Considering that 1.0.0 was just released [two years ago](https://github.com/angular/angular.js/releases/tag/v1.0.0),
it's pretty amazing to see the progress that's been made!

AngularJS is an amazing framework, and it's moving super fast! There are
bound to be cases where we miss an edge case or two due to a new feature
or internal implementation detail in Angular (especially as 1.3.0 moves
through beta!). If you ever run into a snag, please reach out and drop us
a line! We'll check it out and get it fixed in a jiffy.