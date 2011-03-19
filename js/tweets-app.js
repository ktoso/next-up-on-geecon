// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {

    // tweet Model
    // -------------------------------------------------------------------------------------------------------------------

    // Our basic **tweet** model has `content` and `order` attributes.
    window.Tweet = Backbone.Model.extend({

        // Default attributes for the tweet.
        defaults: {
            id:                  "",
            createdAt:           new Date(),
            text:                "",
            source:              "",
            truncated:           "",
            inReplyToStatusId:   "",
            inReplyToUserId:     "",
            favorited:           false,
            inReplyToScreenName: "",
            geo:                 "",
            user:                "null"
        },

        // Ensure that each tweet created has `content`.
        initialize: function() {
            if (!this.get("content")) {
                this.set({"content": this.defaults.content});
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

        // We keep the Tweets in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Tweets are sorted by their original insertion order.
        comparator: function(tweet) {
            return tweet.get('order');
        }

    });

    // Create our global collection of **Tweets**.
    window.Tweets = new TweetList;

    // Tweet Item View
    // -------------------------------------------------------------------------------------------------------------------

    // The DOM element for a tweet item...
    window.TweetView = Backbone.View.extend({

        //... is a list tag.
        tagName:  "article",

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
            console.log(this.model.toJSON());

            $(this.el).html(this.template(this.model.toJSON()));
            this.setContent();
            return this;
        },

        // To avoid XSS (not that it would be harmful in this particular app),
        // we use `jQuery.text` to set the contents of the tweet item.
        setContent: function() {
            var text = this.model.get('text');
            var user = this.model.get('user');
            var content = this.model.get('content');

            console.log("setContent");

//            this.$('.tweet-content').text(content);
//            this.input = this.$('.tweet-input');
//            this.input.bind('blur', this.close);
//            this.input.val(content);
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

            setInterval(this.reFetch, 35 /*s*/ * 1000);
            this.reFetch();
            Tweets.fetch();
        },

        filterer:  function(status) {
            return status.text.match(/geecon/)
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
            this.$("#tweet-list").append(view.render().el);
        },

        // Add all items in the **Tweets** collection at once.
        addAll: function() {
            Tweets.each(this.addOne);
        },

        reFetch: function() {
            // setup anywhere twitter client
            twttr.anywhere(function (T) {
                T.User.find('ktosopl').timeline().first(20).each(function(status) {
//                T.Status.find('#geecon').first(20).filter(filterer).each(function(status){

                    Tweets.create(status);
//
//                    $("#tweet-list").append("<article class=\"tweet\">" +
//                            "<p>" + status.text + "</p>" +
//                            "<small> <strong>" + status.user.screenName + " </strong> @ " + status.createdAt + " <br/></small></article>");
//                    T.linkifyUsers();
                });

            });
        },

        // Generate the attributes for a new Tweet item.
        newAttributes: function() {
            return {
                content: this.input.val(),
                order:   Tweets.nextOrder()
            };
        }

    });

    // Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});