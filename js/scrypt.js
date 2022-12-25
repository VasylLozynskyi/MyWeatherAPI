const weatherBlock = document.querySelector("#weather");
const cityInput = document.querySelector("#cityValue");
const btnForCity = document.querySelector(".btn");

class Weather{
    constructor(weatherBlock, city, server,){
        this.weatherBlock = weatherBlock;
        this.server = server;
        this.city = city;
    }

    async loadweather(){    
        const response = await fetch(this.server, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            if(this.city == responseResult.name){
                this.getWeather(responseResult);
            }
        } else {
            this.createElement(responseResult.message);
        }
    }
    getWeather(data) {
        const location = data.name;
        const temp = Math.round(data.main.temp - 273,15);
        const feelsLike = Math.round(data.main.feels_like - 273,15);
        const weatherStatus = data.weather[0].main;
        const weahterIcon = data.weather[0].icon;
        const country = data.sys.country;
        const template = `
        <div class="weather-header">
            <div class="main">
                <div class="city">${location}</div>
                <div class="country">${country}</div>
                <div class="status">${weatherStatus}</div>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weahterIcon}.png" alt="${weatherStatus}">
            </div>
        </div>
        <div class="temperature">${temp}°C</div>
        <div class="feels-like">Feels like: ${feelsLike}°C</div>`;
        this.createElement(template);
        
    }
    createElement(value) {
        let newEl = document.createElement("div");
        newEl.innerHTML = value;
        let btn = document.createElement("button");
        btn.classList.add("btn-remove");
        btn.textContent = "Remove";
        btn.addEventListener("click", () => {
            btn.parentElement.remove();
        });
        newEl.append(btn);
        this.weatherBlock.append(newEl);
    }
    async loadcity(){
        let getLatLonFromServer = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput.value}&limit=5&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
        const response = await fetch(getLatLonFromServer, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            for (let i = 0; i < responseResult.length; i++){
                if (this.city == responseResult[i].name){
                    this.server = `https://api.openweathermap.org/data/2.5/weather?lat=${responseResult[i].lat}&lon=${responseResult[i].lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
                    this.loadweather();
                }
            }
        } else {this.createElement(responseResult.message);}
    }

}

//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=bfa3a7ce18d4bf2802239bd30542e93e

let london = new Weather(weatherBlock,"London", "https://api.openweathermap.org/data/2.5/weather?lat=51.5085&lon=-0.1257&appid=bfa3a7ce18d4bf2802239bd30542e93e");
let newYork = new Weather(weatherBlock, "New York", "https://api.openweathermap.org/data/2.5/weather?lat=43.0004&lon=-75.4999&appid=bfa3a7ce18d4bf2802239bd30542e93e");
let kyiv = new Weather(weatherBlock, "Kyiv", "https://api.openweathermap.org/data/2.5/weather?lat=50.4333&lon=30.5167&appid=bfa3a7ce18d4bf2802239bd30542e93e");

if(weatherBlock) {
    london.loadweather();
    newYork.loadweather();
    kyiv.loadweather();
}

btnForCity.addEventListener("click", function() {
    if (cityInput.value){
        let link = new Weather(weatherBlock, cityInput.value);
        link.loadcity();
    }
});

