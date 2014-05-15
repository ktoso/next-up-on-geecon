/*
 * Copyright 2011 GeeCON.org. All rights reserved.
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

function relativeTime(pastTime) {
    var origStamp = Date.parse(pastTime);
    var curDate = new Date();
    var currentStamp = curDate.getTime();

    var difference = parseInt((currentStamp - origStamp) / 1000);

    if (difference < 0) {
        return false;
    }

    if (difference <= 5) {
        return "Just now";
    }
    if (difference <= 20) {
        return "Seconds ago";
    }
    if (difference <= 60) {
        return "A minute ago";
    }
    if (difference < 3600) {
        return parseInt(difference / 60) + " minutes ago";
    }
    if (difference <= 1.5 * 3600) {
        return "One hour ago";
    }
    if (difference < 23.5 * 3600) {
        return Math.round(difference / 3600) + " hours ago";
    }
    if (difference < 1.5 * 24 * 3600) {
        return "One day ago";
    }

    var dateArr = pastTime.split(' ');
    return dateArr[4].replace(/\:\d+$/, '') + ' ' + dateArr[2] + ' ' + dateArr[1] + (dateArr[3] != curDate.getFullYear() ? ' ' + dateArr[3] : '');
}

/*-----------------------------------------------------------------------------------------------*/

/*
 * Geefiky v1 - Based on highlight v3 by Johann Burkard
 *
 * <http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>
 *
 * MIT license.
 *
 * Johann Burkard
 * <http://johannburkard.de>
 * <mailto:jb@eaio.com>
 */
jQuery.fn.geekify = function(pat) {
    function innerHighlight(node, pat) {
        var skip = 0;
        if (node.nodeType == 3) {
            var pos = node.data.toUpperCase().indexOf(pat);
            if (pos >= 0) {
                var spannode = document.createElement('span');
                spannode.className = 'geecon-hashtag';
                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(pat.length);
                var middleclone = middlebit.cloneNode(true);
                spannode.appendChild(middleclone);
                middlebit.parentNode.replaceChild(spannode, middlebit);
                skip = 1;
            }
        }
        else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; ++i) {
                i += innerHighlight(node.childNodes[i], pat);
            }
        }
        return skip;
    }

    return this.each(function() {
        innerHighlight(this, pat.toUpperCase());
    });
};

jQuery.fn.ungeekify = function() {
    return this.find("span.geecon-hashtag").each(
            function() {
                this.parentNode.firstChild.nodeName;
                with (this.parentNode) {
                    replaceChild(this.firstChild, this);
                    normalize();
                }
            }).end();
};

/*-----------------------------------------------------------------------------------------------*/

function msAsMinSec(ms) {
    if (ms < 10) {
        return "right now!"
    }

    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    if (hours != undefined && hours > 0) {
        return hours + "h " + minutes + "m " + seconds + "s";
    } else {
        return minutes + "m " + seconds + "s";
    }
}

function getRandomFunnyCountdownNote() {
    var notes = [
        'Will rock the house in...',
        'Validating sessions...',
        'The show will begin in...',
        'Elvis will enter the building in...',
        "Resolving dependencies...",
        "Predicting the future...",
        "Searching for speaker...",
        "Applying automatic self-fix...",
        "Deciphering your passwords...",
        "Cloning into GeeCON...",
        "Synchronizing nodes...",
        "This screen will auto destruct in NaN minutes...",
        "Press any key to continue...",
        "You will be presented CAKE in...",
        "Compilation complete, please insert another coder...",
        "Segmentation fault: core dumped",
        "Looking for extraterrestrial beings...",
        "Implementing presentation...",
        "Downloading speaker..."
        //todo add more fun notes here
    ];

    var i = Math.floor(Math.random() * notes.length);

    return notes[i];
}