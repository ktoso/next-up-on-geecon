/*
 * Copyright 2013 GeeCON.org. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GeeCON.org ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of GeeCON.org.
 */

$(function() {

    // tweet Model
    // -------------------------------------------------------------------------------------------------------------------

    // Our basic **tweet** model has `content` and `order` attributes.
    window.Tweet = Backbone.Model.extend({

        // Default attributes for the tweet.
        defaults: {
            from_user_id_str:  "",
            profile_image_url: "",
            created_at:        null,
            id_str:            "",
            metadata:          "",
            to_user_id:        "",
            text:              "",
            id:                "",
            from_user_id:      "",
            geo:               "",
            from_user:         "",
            iso_language_code: "en",
            source:            "",
            user:              "",
            
            prependMe:         false
        },

        // Ensure that each tweet created has `content`.
        initialize: function() {
            if (!this.get('prependMe')) {
                this.set({'prependMe': this.defaults.prependMe});
            }
        },

        // Remove this tweet from *localStorage* and delete its view.
        clear: function() {
            this.destroy();
            this.view.remove();
        }

    });

    // Tweet Collection
    // -------------------------------------------------------------------------------------------------------------------

    // The collection of tweets is backed by *localStorage* instead of a remote
    // server.
    window.TweetList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Tweet,

        // Save all of the tweet items under the `"tweets"` namespace.
        localStorage: new Store("tweets"),

        // Tweets are sorted by their creation date
        comparator: function(tweet) {
            return tweet.get('id_str');
        }

    });

    // Create our global collection of **Tweets**.
    window.Tweets = new TweetList;

    // Tweet Item View
    // -------------------------------------------------------------------------------------------------------------------

    // The DOM element for a tweet item...
    window.TweetView = Backbone.View.extend({

        //... is a list tag.
        tagName:  "li",

        // Cache the template function for a single item.
        template: _.template($('#tweet-template').html()),

        // The DOM events specific to an item.
        events: {
            // no events
        },

        // The TweetView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a **Tweet** and a **TweetView** in this
        // app, we set a direct reference on the model for convenience.
        initialize: function() {
            _.bindAll(this, 'render', 'close');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        // Re-render the contents of the tweet item.
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setContent();
            return this;
        },

        // To avoid XSS (not that it would be harmful in this particular app),
        // we use `jQuery.text` to set the contents of the tweet item.
        setContent: function() {
            // no content to be set implicitly
        }

    });

    // The Application
    // -------------------------------------------------------------------------------------------------------------------

    // Our overall **AppView** is the top-level piece of UI.
    window.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#tweetsapp"),

        // refresh tweets interval (in ms)
        INTERVAL: 15 * 1000,

        // we'll start prepending them if only updates start coming in
        prependTweets: false,

        // used to get "only new" tweets, will be set during reFetch
        refresh_url: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            // no events
        },

        // At initialization we bind to the relevant events on the `Tweets`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting tweets that might be saved in *localStorage*.
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'render');

            Tweets.bind('add', this.addOne);
            Tweets.bind('refresh', this.addAll);
            Tweets.bind('all', this.render);

            $.each(Tweets, function(it) {
                it.clear();
            });

            this.intervalID = setInterval((function(self) {
                var fun = function() {
                    self.fetchTweets(function() {
                        self.enchantTweets();
                    });
                };
                fun();
                return fun;
            })(this), this.INTERVAL);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            // todo need to do anything here?
        },

        // Add a single tweet item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(tweet) {
            var view = new TweetView({model: tweet});

            var tweetList = this.$("#tweet-list");
            var tweetElement = $(view.render().el);

            if (tweet.get('prependMe')) {
                tweetElement.prependTo(tweetList).hide().slideDown();
            } else {
                tweetElement.appendTo(tweetList).hide().slideDown();
            }

            tweetElement.geekify('#geecon');
            tweetElement.geekify('@geecon');
            tweetElement.geekify('GeeCON');
            tweetElement.geekify('GeeCon');
            tweetElement.geekify('geecon');
            tweetElement.find('span .geecon-hashtag').text(' ');
        },

        enchantTweets: function() {
//            console.log("enchanting tweets...");

            // swap #geecon hashtag with image :-)
            var allTweets = $('#tweet-list article');
            allTweets.geekify('#geecon');
            allTweets.geekify('@geecon');
            allTweets.geekify('GeeCON');
            allTweets.geekify('GeeCon');
            allTweets.geekify('geecon');
            allTweets.find('span .geecon-hashtag').text(' ');

            // @ktosopl links
            twttr.anywhere(function (T) {
                T.linkifyUsers();
            });

//            console.log('done enchanting tweets.');
        },

        // Add all items in the **Tweets** collection at once.
        addAll: function() {
            Tweets.each(this.addOne);
            this.enchantTweets();
        },

        fetchTweets: function(callWhenDone) {
          // it's running Mooch proxy from https://github.com/eloquent/mooch
          var callUrl = 'http://boiling-peak-5721.herokuapp.com/1.1/search/tweets.json';
          var geeconQuery = 'q=geecon';
          var callback = '&callback=?';
          var rpp = '&rpp=50';

          if (this.refresh_url) {
            this.prependTweets = true;
            callUrl += this.refresh_url + callback + rpp;
          } else {
            callUrl += "?" + geeconQuery + callback + rpp;
          }

          var self = this;
          $.getJSON(callUrl,
              function (data) {

                console.log(data);

                $.each(data.statuses, function (index, tweet) {
                  tweet.prependMe = self.prependTweets;
                  Tweets.create(tweet);
                });

                callWhenDone();

                self.refresh_url = data.refresh_url;
              });
        }
    });

// Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});
