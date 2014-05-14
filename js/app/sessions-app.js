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
    window.Session = Backbone.Model.extend({

        // Default attributes for the tweet.
        defaults: {
            onDay:      '',
            startsAt:   '',

            inRoom:     '',
            isThisRoom: false,
            speaker:    '',
            topic:      ''
        },

        // Ensure that each tweet created has `content`.
        initialize: function() {
            if (!this.get('isThisRoom')) {
                this.set({'isThisRoom': this.defaults.isThisRoom});
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
        comparator: function(session) {
            return session.get('inRoom');
        }

    });

    // Create our global collection of **Sessions**.
    window.Sessions = new SessionList;

    // Session Item View
    // -------------------------------------------------------------------------------------------------------------------

    // The DOM element for a session item...
    window.SessionView = Backbone.View.extend({

        //... is a list tag.
        tagName:  "li",

        // Cache the template function for a single item.
        template: _.template($('#session-template').html()),

        // The DOM events specific to an item.
        events: {
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

        // refresh intervals, for timer and countdown note
        SEC: 1000,
        MIN: 60000,

        // pass #3 to the site to state "this room is room number 3"
        THIS_ROOM: parseInt(location.hash.substr(1)),

        // count until this time (variable used by the countdown, and set after agenda fetch)
        countUntil: 0,

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

            Sessions.bind('add', this.addOne);
            Sessions.bind('refresh', this.addAll);
            Sessions.bind('all', this.render);

            // clean up local cache
            $.each(Sessions, function(it) {
                it.clear();
            });

//            console.log("This room's number is: " + this.THIS_ROOM);

            $('#countdown-container').fadeIn('slow');

            // jquery error handler
            $("#debug").ajaxError(function(event, request, settings) {
                $(this).append("<li>Error requesting page " + settings.url + "</li>");
//                console.log(settings);
            });

            this.loadAgenda();

            this.updateCountdownNote();
            this.intervalEachSec = setInterval((function(self) {
                var fun = function() {
                    self.updateCountdown();
                };
                fun();
                return fun;
            })(this), this.SEC);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            // todo do anything here?
        },

        updateCountdown: function() {
            var timeLeft = Date.parse(this.countUntil) - Date.now();
            var minSec = msAsMinSec(timeLeft);

            if (/^0m 0s/.test(minSec)) {
                this.updateCountdownNote('Sessions start');
                document.location.reload();
            } else if (/ 0s$/.test(minSec)) {
                this.updateCountdownNote();
            }

//          disable countdown - we have 4 tracks - it won't fit
//            $('#countdown').text(minSec);
        },

        // update the countdown text to the given message, or if none given,
        // just take a random one using getRandomFunnyCountdownNote();
        updateCountdownNote: function(message) {
            if (!message) {
                message = getRandomFunnyCountdownNote();
            }

            $('#funny-note').text(message);
        },

        // fetch the agenda.json file (with no caching) and
        // load only those sessions that matter to us right now
        loadAgenda: function () {
            var noCachePlease = "?nocache=" + Math.random();
            var agendaLocation = this.AGENDA + noCachePlease;

            var self = this;
            $.getJSON(agendaLocation,
                function (data) {
                  data.agenda = self.filterAgendaForOnlyNextSpeeches(data);

                  var today = Date.today();

                  for (var i = 0; i < data.agenda.length; i++) {
                    var session = data.agenda[i];
                    console.log(session);
                    var sessionDay = Date.parse(session.onDay);
                    if (sessionDay.equals(today)) {
                      session.isThisRoom = session.inRoom == this.THIS_ROOM;
                      Sessions.create(session);
                    }
                  }

                });
        },

        // filter agenda to contain only the immediate next speeches
        // for example it's 21 May 2013 15:15, so only speeches on this day
        // and starting after 15:15 would be kept in the agenda
        filterAgendaForOnlyNextSpeeches: function(agenda) {
            var now = Date.now();
            var today = Date.today();

            // filter for today
            console.log(agenda.length);
            agenda = _.filter(agenda, function(speech) {
                var day = Date.parse(speech.onDay);
                var starts = Date.parse(speech.startsAt);
                return (day.getDate() === today.getDate()) && now.compareTo(starts) == -1;
//                          && starts.isAfter(now);
                        /*starts is in the future, somehow isAfter won't work... */
            });

            if (agenda.length > 0) {
                this.countUntil = agenda[0].startsAt;
            }

            return agenda;
        },

        // Add a single session item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(session) {
            var view = new SessionView({model: session});

            var sessionList = this.$("#session-list");
            var sessionElement = $(view.render().el);

            sessionElement.addClass('this-room');
            sessionElement.appendTo(sessionList).hide().fadeIn('slow');

        },

        // Add all items in the **Sessions** collection at once.
        addAll: function() {
            Sessions.each(this.addOne);
        }

    });

// Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});
