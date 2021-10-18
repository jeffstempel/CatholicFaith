var holyDays = [
    {day: new Date("January 1, 2021"), description: "Blessed Virgin Mary, Mother of God"},
    {day: new Date("January 6, 2021"), description: "Epiphany"},
    {day: new Date("March 19, 2021"), description: "Saint Joseph"},
    {day: new Date("March 25, 2021"), description: "The Annunciation"},
    {day: new Date("April 4, 2021"), description: "Easter"},
    {day: new Date("May 13, 2021"), description: "Ascension of the Lord"},
    {day: new Date("May 23, 2021"), description: "Pentecost"},
    {day: new Date("May 30, 2021"), description: "Trinity Sunday"},
    {day: new Date("June 3, 2021"), description: "Corpus Christi"},
    {day: new Date("June 11, 2021"), description: "Most Sacred Heart of Jesus"},
    {day: new Date("June 24, 2021"), description: "Nativity of Saint John the Baptist"},
    {day: new Date("June 29, 2021"), description: "Saints Peter and Paul"},
    {day: new Date("August 15, 2021"), description: "Assumption of Mary"},
    {day: new Date("November 1, 2021"), description: "All Saints"},
    {day: new Date("November 22, 2021"), description: "Our Lord Jesus Christ the King of the Universe"},
    {day: new Date("December 8, 2021"), description: "Immaculate Conception"},
    {day: new Date("December 25, 2021"), description: "Christmas!!!"}];

var today = new Date();

for (var i = 0; i < holyDays.length; i++)
{
	if (today.toDateString() == holyDays[i].day.toDateString())
	{
		document.getElementById("yesno").innerHTML = "YES!";
		document.getElementById("desc").innerHTML = holyDays[i].description;
		i = 100;
	}
}