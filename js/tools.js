function relativeTime(pastTime) {
    var origStamp = Date.parse(pastTime);
    var curDate = new Date();
    var currentStamp = curDate.getTime();

    var difference = parseInt((currentStamp - origStamp) / 1000);

    if (difference < 0) return false;

    if (difference <= 5)                return "Just now";
    if (difference <= 20)            return "Seconds ago";
    if (difference <= 60)            return "A minute ago";
    if (difference < 3600)            return parseInt(difference / 60) + " minutes ago";
    if (difference <= 1.5 * 3600)         return "One hour ago";
    if (difference < 23.5 * 3600)        return Math.round(difference / 3600) + " hours ago";
    if (difference < 1.5 * 24 * 3600)    return "One day ago";

    var dateArr = pastTime.split(' ');
    return dateArr[4].replace(/\:\d+$/, '') + ' ' + dateArr[2] + ' ' + dateArr[1] + (dateArr[3] != curDate.getFullYear() ? ' ' + dateArr[3] : '');
}


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


/**
 *
 *  Javascript trim, ltrim, rtrim
 *  http://www.webtoolkit.info/
 *
 **/

function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

function msAsMinSec(ms) {
    if (ms < 10) {
        return "right now!"
    }

    var seconds = ms / 1000;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return minutes + "m " + seconds + "s";
}

function getRandomFunnyCountdownNote() {
    var notes = [
        'Will rock the house in...',
        'Deploying sessions, please wait...',
        'The show will begin in...',
        'Elvis will enter the building in...',
        "We'll let the groove out in...",
        "Downloading awesomeness...",
        "Resolving dependencies...",
        "Predicting future...",
        "Playing lotto...",
        "Deciphering your passwords...",
        "Please wait..."
        //todo add more fun notes here
    ];

    var i = Math.floor(Math.random() * notes.length);

    return notes[i];
}