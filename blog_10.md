# PubNub AngularJS Library - Now Featuring Docco Documentation!

Here at PubNub, we love documentation, as you probably already guessed
from our extensive collection of [client SDKs](http://www.pubnub.com/developers/) and
[detailed API documentation](http://www.pubnub.com/docs/javascript/api/reference.html).
Up until now, we've been using Markdown mostly for the [README-level documentation](https://github.com/pubnub/pubnub-angular/blob/master/README.md) of the
AngularJS library. This README is still super useful, although we hope to experiment with
[asciidoc](http://www.methods.co.nz/asciidoc/) at some point in the future. But more
importantly for this blog entry, we recently discovered the [Docco](http://jashkenas.github.io/docco/)
library for creating annotated source code, and instantly fell in love!

You may already be familiar with Docco if you use the [Underscore JS](http://underscorejs.org/) library - it's what
powers the Underscore [annotated source code](http://underscorejs.org/docs/underscore.html)
feature. We found it to be tremendously helpful as we learned about Underscore internals,
and figured we'd try to apply this awesome tool to the [PubNub AngularJS](https://github.com/pubnub/pubnub-angular)
library as well!

Using Docco is just about as simple as you can get:

1. Install docco via `npm install -g docco`
2. Add comments to your JavaScript (or, in our case, CoffeeScript) source code
3. Run `docco source_file.coffee` to generate the HTML documentation! (in a 'docs' directory by default)

Please check out our initial cut of the documentation here at the [PubNub AngularJS annotated source code](http://pubnub.github.io/pubnub-angular/docs/pubnub-angular.html),
and let us know what you think! We love the idea of helping developers gain more insight
into how this powerful library works, as well as provide an easy way for developers to
easily submit changes or updates to the documentation.

Do you have any tips, tricks or best practices that you'd suggest for the PubNub
JavaScript frameworks or other SDK's? Please drop us a line and let us know!
