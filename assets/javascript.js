var apiKey = 'cbd9375ec50e479521231c47f4b76ae3';
var weatherCurrentQueryBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?appid=cbd9375ec50e479521231c47f4b76ae3&q=';
var cityName = "Boston";
var weatherFiveDayQueryBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast?appid=cbd9375ec50e479521231c47f4b76ae3&q='
var weatherOneCallQueryBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=cbd9375ec50e479521231c47f4b76ae3&lat="
var geocoder = new google.maps.Geocoder;
var place = "";
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

function searchCity(event) {
    console.log($('#citySearchBox').val());
    place = $('#citySearchBox').val();
    console.log("test");
    geocoder.geocode({ 'address': place }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            var searchCityUrl = weatherOneCallQueryBaseUrl + latitude + "&lon=" + longitude;
            apiCall(searchCityUrl, testFunction)
            console.log("ok");
            console.log(latitude);
            console.log(longitude);

        }

    })
}

$('#citySearchButton').on('click', function () {
    event.preventDefault();
    searchCity();
});


google.maps.event.addDomListener(window, 'load', initialize);


// var queryUrl = weatherFiveDayQueryBaseUrl + cityName;
// apiCall(queryUrl, testFunction);