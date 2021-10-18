var emberDays = [
    {day: new Date("December 15, 2021"), description: "Ember Wednesday of Advent"},
    {day: new Date("October 17, 2021"), description: "Ember Friday of Advent"},
    {day: new Date("December 18, 2021"), description: "Ember Saturday of Advent"}];

var today = new Date();
var isEmberDay = IsTodayAnEmberDay();
if (!isEmberDay){
    SetNextEmberDay();
}

function IsTodayAnEmberDay(){
    for (var i = 0; i < emberDays.length; i++)
    {
        if (today.toDateString() == emberDays[i].day.toDateString()) {
            document.getElementById("yesno").innerHTML = "YES!";
            document.getElementById("desc").innerHTML = emberDays[i].description;
            return true;
        }
    }
    return false;
}

function SetNextEmberDay(){
    for (var i = 0; i < emberDays.length; i++) {
        if (today < emberDays[i].day )
        {
            document.getElementById("desc").innerHTML = "The next Ember Day is " + emberDays[i].day.toDateString();
            break;
        }
    }
}
