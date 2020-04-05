var apiKey = 'cbd9375ec50e479521231c47f4b76ae3';
var weatherQueryBaseUrl = 'https://api.openweathermap.org/data/2.5/weather?appid=cbd9375ec50e479521231c47f4b76ae3&q=';
var cityName = "Boston";


function apiCall(apiQuery, apiFunction) {
    $.ajax({
        url: apiQuery,
        method: "GET"
    }).then(apiFunction)
}

function testFunction(response) {
    console.log(response);
}

var queryUrl = weatherQueryBaseUrl + cityName;
apiCall(queryUrl, testFunction);