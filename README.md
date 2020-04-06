# WeatherDashboard

# Project Title
Week 6 Homework Assignment - Weather Dashboard

# Motivation 
THis homework will deliver a fully functioning weather dashboard thzt utlizes a dynamically updating content page, saved search history, and location autocomplete. It will allow practice with using third party APIs and Jquery manipulation of the DOM.

# Code Style
This project is written using Java script and the Bootstrap CDN for layout and mobile responsiveness. Jquery is used for selectors and manipulation of the Dom. The OpenWeather API is used to pull current and future weather data and Google's Maps API is used for both geo conversion and auto completion of typed locations. Moment.js calls are made to get the current time and convert the returned UTC time into a easily read format. 

# Screenshots


Initial Load Screen



![Initial](Screenshots/initialview.JPG "Initial Load Screen")


Full Screen View


![FullScreen](Screenshots/fullscreen.JPG "Full Screen")



Mobile Layout View


![MobileLayout](Screenshots/mobileview.JPG "Mobile Layout Screen")



# Features
Google autocompletes entered addresses and the result is standardized into either City, State or State, Country.

Buttons are created dyanmically and added to the DOM to provide easy call back. Search history caps at ten and pushes the oldest entries from memory

Times are accurately calculated using a conversion from UTC via moment.js

# Code Example
This function handles building the displayed city name and standardizes the returned result regardless of how much or little data the user provided. 

//Constructs the city name for display from information passed from weather API
function buildCityName(geoInfo) {
    cityNameDisplay = "";
    //Flags city found as false in case just a state is entered and a state flag if just a country is entered.
    var cityFound = false;
    var stateFound = false;
    for (i = 0; i < geoInfo.address_components.length; i++) {
        if (geoInfo.address_components[i].types[0] == "locality") {
            cityNameDisplay = cityNameDisplay + geoInfo.address_components[i].long_name + ", ";
            var cityFound = true;
        }
        else if (geoInfo.address_components[i].types[0] == "administrative_area_level_1") {
            cityNameDisplay = cityNameDisplay + geoInfo.address_components[i].short_name;
            var stateFound = true;
        }
        else if (geoInfo.address_components[i].types[0] == "country" && cityFound == false && stateFound == true) {
            cityNameDisplay = cityNameDisplay + ", " + geoInfo.address_components[i].short_name;
        }
        else if (stateFound == false && cityFound == false) {
            cityNameDisplay = geoInfo.address_components[i].short_name;
        }
    }
}




This function examines the returned city name to compared it against current values and prevent duplication. If more than ten entries are present, it removes the first and adds the newest to the end of the array

function updateSearchHistory(searchString) {
    //Cyces through etries to see if they already exist.
    for (i = 0; i < searchedCities.length; i++) {
        if (searchedCities[i] == searchString) {
            return;
        }
    }
    //Caps limit at ten and removes first entry if greater than
    if (searchedCities.length >= 10) {
        searchedCities.shift();
    }
    //Adds new city to search history array. Converts for local storage and saves
    searchedCities.push(searchString);
    var searchedCitiesHolder = JSON.stringify(searchedCities);
    localStorage.setItem('wdSearchHistory', searchedCitiesHolder);
    buildSearchButtons();
}

# How to Use
Enter any address with as much or as little detail as required. Click the submit button to load the results. Click any saved history button to generate the current information for the previous city.