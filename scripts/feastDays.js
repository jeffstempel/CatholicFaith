var feasts = [
    {day: new Date("January 1, 2021"), description: "Octave Day of the Nativity"},
    {day: new Date("May 13, 2021"), description: "Ascension of the Lord"},
    {day: new Date("August 15, 2021"), description: "Assumption of Mary"},
    {day: new Date("November 1, 2021"), description: "All Saints"},
    {day: new Date("December 8, 2021"), description: "Immaculate Conception"},
    {day: new Date("December 25, 2021"), description: "Christmas!!!"}];

var today = new Date();
var isFeast = IsTodayAFeast();
if (!isFeast){
    SetNextFeast();
}

function IsTodayAFeast(){
    for (var i = 0; i < feasts.length; i++)
    {
        if (today.toDateString() == feasts[i].day.toDateString())
        {
            document.getElementById("feastYesNo").innerHTML = "YES!";
            document.getElementById("feastDesc").innerHTML = feasts[i].description;
            return true;
        }
    }
    return false;
}

function SetNextFeast(){
    for (var i = 0; i < feasts.length; i++) {
        if (today < feasts[i].day )
        {
            document.getElementById("feastDesc").innerHTML = 
            "The next Feast Day is " + feasts[i].day.toDateString() +
            ' ' + feasts[i].description;
            break;
        }
    }
}