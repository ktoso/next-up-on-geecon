// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {

    // tweet Model
    // -------------------------------------------------------------------------------------------------------------------

    // Our basic **tweet** model has `content` and `order` attributes.
    window.Session = Backbone.Model.extend({

        // Default attributes for the tweet.
        defaults: {
            onDay:    '',
            startsAt: '',

            inRoom:     '',
            speaker:  '',
            topic:    ''
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
    window.SessionList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Session,

        // Save all of the tweet items under the `"tweets"` namespace.
        localStorage: new Store("sessions"),

        // We keep the Sessions in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Sessions are sorted by their creation date
        comparator: function(tweet) {
            return session.get('id_str');
        }

    });

    // Create our global collection of **Sessions**.
    window.Sessions = new SessionList;

    // Session Item View
    // -------------------------------------------------------------------------------------------------------------------

    // The DOM element for a session item...
    window.SessionView = Backbone.View.extend({

        //... is a list tag.
        tagName:  "div",

        // Cache the template function for a single item.
        template: _.template($('#session-template').html()),

        // The DOM events specific to an item.
        events: {
//            "dblclick div.session-content" : "edit",
//            "click span.session-destroy"   : "clear",
//            "keypress .session-input"      : "updateOnEnter"
        },

        // The SessionView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a **Session** and a **SessionView** in this
        // app, we set a direct reference on the model for convenience.
        initialize: function() {
            _.bindAll(this, 'render', 'close');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        // Re-render the contents of the session item.
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setContent();
            return this;
        },

        // To avoid XSS (not that it would be harmful in this particular app),
        // we use `jQuery.text` to set the contents of the session item.
        setContent: function() {
//            var text = this.model.get('text');
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
        el: $("#sessionsapp"),

        // the today date, for further use
        TODAY: Date.today(),

        // the date of the first day with sessions (day: 1) in the data JSON
        DAY_1: Date.today(),

        // refresh the timer each second
        INTERVAL: 1000,

        // the location of our agenda file
        AGENDA: 'data/agenda.json',

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "click .session-clear a": "clearCompleted"
        },

        // At initialization we bind to the relevant events on the `Sessions`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting sessions that might be saved in *localStorage*.
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'render');

            this.input = this.$("#new-session");

            Sessions.bind('add', this.addOne);
            Sessions.bind('refresh', this.addAll);
            Sessions.bind('all', this.render);

            console.log("Loading agenda...");

            $("#debug").ajaxError(function(event, request, settings) {
                $(this).append("<li>Error requesting page " + settings.url + "</li>");
                console.log(settings);
            });

            this.loadAgenda();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            // todo need to do anything here?
        },

        loadAgenda: function () {
            var agendaLocation = this.AGENDA + "?nocache=" + Math.random();
            console.log("Fetching agenda from: " + agendaLocation);

            var self = this;
            $.getJSON(agendaLocation,
                    function(data, textStatus) {
                        console.log("fetched agenda...");
                        console.log(data);

                        $.each(data.agenda, function(index, session) {
                            var sessionDay = Date.format(session.onDay);
                            console.log("today is " + Date.today() + " and sessionDay is " + sessionDay)
                            if (sessionDay.is().today()) {
                                console.log(session);
                                Session.create(session);
                            }
                        });
                    });
        },

        // Add a single session item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(session) {
            var view = new SessionView({model: session});

            var sessionList = this.$("#session-list");
            var sessionElement = $(view.render().el);

            if (session.get('prependMe')) {
                sessionElement.prependTo(sessionList).hide().slideDown();
            } else {
                sessionElement.appendTo(sessionList).hide().slideDown();
            }
        },

        // Add all items in the **Sessions** collection at once.
        addAll: function() {
            Sessions.each(this.addOne);
        }

    });

// Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});