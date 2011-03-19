// Load the application once the DOM is ready, using `jQuery.ready`:
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
            relative_time:     "A few seconds ago",
            id_str:            "",
            metadata:          "",
            to_user_id:        "",
            text:              "",
            id:                "",
            from_user_id:      "",
            geo:               "",
            from_user:         "",
            iso_language_code: "en",
            source:            ""
        },

        // Ensure that each tweet created has `content`.
        initialize: function() {
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

        // We keep the Tweets in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

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
//            "dblclick div.tweet-content" : "edit",
//            "click span.tweet-destroy"   : "clear",
//            "keypress .tweet-input"      : "updateOnEnter"
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
            var text = this.model.get('text');
            var user = this.model.get('user');
        },

        // If you hit `enter`, we're through editing the item.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) this.close();
        },

        // Remove this view from the DOM.
        remove: function() {
            $(this.el).remove();
        },

        // Remove the item, destroy the model.
        clear: function() {
            this.model.clear();
        }

    });

    // The Application
    // -------------------------------------------------------------------------------------------------------------------

    // Our overall **AppView** is the top-level piece of UI.
    window.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#tweetsapp"),

        // used to get "only new" tweets, will be set during reFetch
        refresh_url: '',

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "click .tweet-clear a": "clearCompleted"
        },

        // At initialization we bind to the relevant events on the `Tweets`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting tweets that might be saved in *localStorage*.
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'render');

            this.input = this.$("#new-tweet");

            Tweets.bind('add', this.addOne);
            Tweets.bind('refresh', this.addAll);
            Tweets.bind('all', this.render);

            $.each(Tweets, function(it) {
                it.clear();
            });

            setInterval(this.fetchTweets, 35 /*s*/ * 1000);
            this.fetchTweets();
            Tweets.fetch();
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
            this.$("#tweet-list").append(view.render().el).hide().slideDown('slow');
            twttr.anywhere(function (T) {
                T.linkifyUsers();
            });
        },

        // Add all items in the **Tweets** collection at once.
        addAll: function() {
            Tweets.each(this.addOne);
        },

        fetchTweets: function() {
            var geecon = 'geecon';

            var callUrl = 'http://search.twitter.com/search.json'
            var callback = '&callback=?';
            if (this.refresh_url != null) {
                callUrl += this.refresh_url + callback;
            } else {
                callUrl += "?q=" + geecon;
            }

            console.log('Calling: ' + callUrl);

            $.getJSON(callUrl,
                    function(data) {

                        console.log(data);

                        $.each(data.results, function(index, tweet) {
                            tweet.relative_time = relativeTime(tweet.created_at);
                            Tweets.create(tweet);
                        });

                        this.refresh_url = data.refresh_url;
                        console.log("Saved refresh_url as: " + this.refresh_url);
                    });
        }
    });

// Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});