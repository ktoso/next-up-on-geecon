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