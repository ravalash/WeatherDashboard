//Initial variable declaration
var weatherOneCallQueryBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=cbd9375ec50e479521231c47f4b76ae3&units=imperial&lat="
var geocoder = new google.maps.Geocoder;
var place = "";
var cityNameDisplay = "";
var currentCityData = [];
var currentCityGeo = [];
var searchedCities = [];

//Makes API calls. Requires a query URL and a function to run when complete
function apiCall(apiQuery, apiFunction) {
    $.ajax({
        url: apiQuery,
        method: "GET"
    }).then(apiFunction)
}

//Loads Google Places search and autocomplete functionality
function initialize() {
    var input = document.getElementById('citySearchBox');
    new google.maps.places.Autocomplete(input);
}

//Searches for city from search box or clicked button from history
function searchCity(history) {
    if (history == null) {
        place = $('#citySearchBox').val();
    }
    else {
        place = history;
    }
    geocodeCity(place);
}

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
            cityNameDisplay = geoInfo.address_components[i].long_name;
        }
    }
}

//Converts entered city name using google geocode API for accurate lat and long
function geocodeCity(location) {
    geocoder.geocode({ 'address': location }, function (results, status) {
        //Handler for gibberish entries into search box
        if (status == google.maps.GeocoderStatus.OK) {
            currentCityGeo = results[0];
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            var searchCityUrl = weatherOneCallQueryBaseUrl + latitude + "&lon=" + longitude;
            apiCall(searchCityUrl, loadCurrent);
        }
    })
}

//Reads saved search history from local storage
function loadSearchHistory() {
    var savedHistory = localStorage.getItem('wdSearchHistory');
    if (savedHistory == null) {
        searchedCities = [];
    }
    else {
        searchedCities = JSON.parse(savedHistory);
        buildSearchButtons();
    }
}

//Handles updating array of saved searches
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

//Builds search history buttons, assigns data value to store formatted name
function buildSearchButtons() {
    $('#searchHistoryList').empty();
    for (i = searchedCities.length - 1; i >= 0; i--) {
        var newSearchButton = $("<button type='button' class='list-group-item list-group-item-action' data='" + searchedCities[i] + "'> </button>");
        newSearchButton.text(searchedCities[i]);
        console.log(newSearchButton);
        $('#searchHistoryList').append(newSearchButton);
    }
    $('.list-group-item-action').on('click', function () {
        loadSearchButton($(this))
    });
}

//Handles events for clicked search history buttons
function loadSearchButton(response) {
    var searchHistoryString = response.attr('data');
    searchCity(searchHistoryString);
}

//Dynamically updates the main content window with both current and five day forecast
function loadCurrent(response) {
    $('#fiveDayRow').removeAttr('hidden');
    $('#citySearchBox').val("");
    currentCityData = response;
    console.log(currentCityData);
    buildCityName(currentCityGeo);
    updateSearchHistory(cityNameDisplay);
    cityNameDisplay = cityNameDisplay + " (" + moment().tz(currentCityData.timezone).format('l, h:mma') + ")";
    $('#currentCityName').text(cityNameDisplay);
    $('#currentCityIcon').attr("src", "http://openweathermap.org/img/wn/" + currentCityData.current.weather[0].icon + "@2x.png");
    $('#currentCityIcon').removeAttr("hidden");
    $('#currentCityTemperature').html("Temperature: " + currentCityData.current.temp + " &deg;F");
    $('#currentCityHumidity').html("Humidity: " + currentCityData.current.humidity + "&percnt;");
    $('#currentCityWindSpeed').html("Wind Speed: " + currentCityData.current.wind_speed + " MPH");
    var loadCurrentUV = parseFloat(currentCityData.current.uvi);
    $('#currentCityUV').html("UV Index: <span id='currentCityUVColor'>" + loadCurrentUV + "</span>");
    //Handles color coding for UVI scale
    if (loadCurrentUV < 3) {
        var loadCurrentUVColor = "green";
    }
    else if (loadCurrentUV >= 3 && loadCurrentUV < 6) {
        var loadCurrentUVColor = "yellow";
    }
    else if (loadCurrentUV >= 6 && loadCurrentUV < 8) {
        var loadCurrentUVColor = "orange";
    }
    else if (loadCurrentUV >= 8 && loadCurrentUV < 11) {
        var loadCurrentUVColor = "red";
    }
    else {
        var loadCurrentUVColor = "purple";
    }
    $('#currentCityUVColor').attr("style", "background-color:" + loadCurrentUVColor);
    //Cycles through fie days of data to build cards for forecast
    for (i = 1; i < 6; i++) {
        var forecastDay = "#day" + i;
        var forecastData = currentCityData.daily[i];
        $(forecastDay).children().children('.card-title').eq(0).html(moment(01 / 01 / 1970).add(forecastData.dt, 'seconds').format('l'))
        console.log(moment(19700101).add(forecastData.dt, 'seconds').format('L'));
        console.log(forecastDay);
        var forecastIcon = forecastData.weather[0].icon;
        $(forecastDay).children().children('img').eq(0).attr('src', "http://openweathermap.org/img/wn/" + forecastIcon + "@2x.png")
        $(forecastDay).children().children('p').eq(0).html("Temp: " + forecastData.temp.max + " &deg;F");
        $(forecastDay).children().children('p').eq(1).html("Humidity: " + forecastData.humidity + "&percnt;");

    }
}

//Event listener for search box button
$('#citySearchButton').on('click', function () {
    event.preventDefault();
    searchCity();
});

$('#clearHistoryConfirm').on('click', function () {
    event.preventDefault();
    if (searchedCities.length === 0) {
        console.log('empty');
    }
    else {
        searchedCities = [];
        localStorage.removeItem('wdSearchHistory');
        buildSearchButtons();
    }
    $('#clearHistoryModal').modal('hide');


})

//initiliazes google maps autocomplete
google.maps.event.addDomListener(window, 'load', initialize);
loadSearchHistory();
;