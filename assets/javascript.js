var apiKey = 'cbd9375ec50e479521231c47f4b76ae3';
var weatherCurrentQueryBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?appid=cbd9375ec50e479521231c47f4b76ae3&q=';
var cityName = "Boston";
var weatherFiveDayQueryBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast?appid=cbd9375ec50e479521231c47f4b76ae3&q='
var weatherOneCallQueryBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=cbd9375ec50e479521231c47f4b76ae3&units=imperial&lat="
var geocoder = new google.maps.Geocoder;
var place = "";
var cityNameDisplay = "";
var currentCityData = [];
var currentCityGeo = [];
var searchedCities = {};
var test = '';
//Icon URL http://openweathermap.org/img/wn/10d@2x.png


function apiCall(apiQuery, apiFunction) {
    $.ajax({
        url: apiQuery,
        method: "GET"
    }).then(apiFunction)
}

function testFunction(response) {
    console.log(response);
}

//Loads Google Places search and autocomplete functionality
function initialize() {
    var input = document.getElementById('citySearchBox');
    new google.maps.places.Autocomplete(input);
}

function searchCity(history) {
    if (history == null) {
        console.log($('#citySearchBox').val());
        place = $('#citySearchBox').val();
        console.log("test");
    }
    else {
        console.log(history);
        place = history;
    }
    geocodeCity(place);

}

function buildCityName(geoInfo) {
    cityNameDisplay = "";
    var cityFound = false;
    for (i = 0; i < geoInfo.address_components.length; i++) {
        if (geoInfo.address_components[i].types[0] == "locality") {
            cityNameDisplay = cityNameDisplay + geoInfo.address_components[i].long_name + ", ";
            var cityFound = true;
        }
        else if (geoInfo.address_components[i].types[0] == "administrative_area_level_1") {
            cityNameDisplay = cityNameDisplay + geoInfo.address_components[i].short_name;
        }
        else if (geoInfo.address_components[i].types[0] == "country" && cityFound === false) {
            cityNameDisplay = cityNameDisplay + ", " + geoInfo.address_components[i].short_name;
        }
    }
    console.log(cityNameDisplay);
}

function geocodeCity(location) {
    geocoder.geocode({ 'address': location }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            currentCityGeo = results[0];
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            var searchCityUrl = weatherOneCallQueryBaseUrl + latitude + "&lon=" + longitude;
            apiCall(searchCityUrl, loadCurrent);
        }

    })

}

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

function updateSearchHistory(searchString) {
    for (i = 0; i < searchedCities.length; i++) {
        if (searchedCities[i] == searchString) {
            return;
        }
    }
    if (searchedCities.length >= 10) {
        searchedCities.shift();
    }
    searchedCities.push(searchString);
    var searchedCitiesHolder = JSON.stringify(searchedCities);
    localStorage.setItem('wdSearchHistory', searchedCitiesHolder);
    buildSearchButtons();
}

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

function loadSearchButton(response) {
    var searchHistoryString = response.attr('data');
    searchCity(searchHistoryString);
}

function loadCurrent(response) {
    $('#fiveDayRow').removeAttr('hidden');
    $('#citySearchBox').val("");
    currentCityData = response;
    console.log(currentCityData);
    buildCityName(currentCityGeo);
    updateSearchHistory(cityNameDisplay);
    cityNameDisplay = cityNameDisplay + " (" + moment().format("l") + ", " + moment().format("LT") + ")";
    $('#currentCityName').text(cityNameDisplay);
    $('#currentCityIcon').attr("src", "http://openweathermap.org/img/wn/" + currentCityData.current.weather[0].icon + "@2x.png");
    $('#currentCityIcon').removeAttr("hidden");
    $('#currentCityTemperature').html("Temperature: " + currentCityData.current.temp + " &deg;F");
    $('#currentCityHumidity').html("Humidity: " + currentCityData.current.humidity + "&percnt;");
    $('#currentCityWindSpeed').html("Wind Speed: " + currentCityData.current.wind_speed + " MPH");
    var loadCurrentUV = parseFloat(currentCityData.current.uvi);
    $('#currentCityUV').html("UV Index: <span id='currentCityUVColor'>" + loadCurrentUV + "</span>");
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
    for (i = 1; i < 6; i++) {
        var forecastDay = "#day" + i;
        var forecastData = currentCityData.daily[i];
        $(forecastDay).children().children('.card-title').eq(0).html(moment(19700101).add(forecastData.dt, 'seconds').format('l'))
        console.log(moment(19700101).add(forecastData.dt, 'seconds').format('L'));
        console.log(forecastDay);
        var forecastIcon = forecastData.weather[0].icon;
        $(forecastDay).children().children('img').eq(0).attr('src', "http://openweathermap.org/img/wn/" + forecastIcon + "@2x.png")
        $(forecastDay).children().children('p').eq(0).html("Temp: " + forecastData.temp.max + " &deg;F");
        $(forecastDay).children().children('p').eq(1).html("Humidity: " + forecastData.humidity + "&percnt;");

    }

}
// http://openweathermap.org/img/wn/10d@2x.png


$('#citySearchButton').on('click', function () {
    event.preventDefault();
    searchCity();
});


google.maps.event.addDomListener(window, 'load', initialize);
loadSearchHistory();
// console.log(moment('1586192400').format('L'));
// var queryUrl = weatherFiveDayQueryBaseUrl + cityName;
// apiCall(queryUrl, testFunction);