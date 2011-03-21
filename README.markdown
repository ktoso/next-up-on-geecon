Next Up On GeeCON
=================
Is a (more or less) simple **pure JavaScript** app that'll be used to display data about upcomming sessions during breaks during **GeeCON 2011** in Cracow.
The app will be displayed on big cinema screens... :-)

So, what is **GeeCON** actually...?
-----------------------------------
**<a href="http://geecon.org/">GeeCON</a>** is a JVM centric (Java, Scala, Groovy, JRuby etc...) 4 day long conference organized by 
the <a href="http://www.java.pl">Polish Java User Group</a> and the <a href="http://www.jug.poznan.pl/">Poznań Java User Group</a> each year in May - since 2009.
It's quite big there's always lots of interesting (and eager to have a chat about coding) people there and I'd highly recommend you'd <a href="http://geecon.org">check it out</a> if you haven't yet heard about it. :-)

Used tech
---------
The app relies on the following frameworks to get things done:

* **Backbone.js** - a very awesome JavaScript MVC framework which made the development of this app a pure joy for the senses ;-)
* **underscore.js** - a simple 'functional' library for JavaScript, it's used internally by backbone and by me for some \_.filter, \_.map(), \_.fold() fun :-)
* **jQuery** - a quite big yet powerful lib everybody knows I guess. It's used here primarily to bind the app into the DOM and modify it. Oh, and it's also used here for AJAX stuff.
* **@anywhere** - I thought I'd use it (it's the new twitter API) but it turned out that it isn't supporting Status.search... (Though it's in it's documentation heh) so we're using plain old search.twitter.com here, and it runns really well ;-)

License
-------
I'm releasing this code under the **FreeBSD License**, thus it's OpenSource and Free Software. 

Keep in mind that you **MUST** keep the copyright notice in your app based on top of this one, for more details, please visit: 
