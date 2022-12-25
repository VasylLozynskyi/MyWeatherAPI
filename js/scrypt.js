const weatherBlock = document.querySelector("#weather");
const cityInput = document.querySelector("#cityValue");
const btnForCity = document.querySelector(".btn");

class Weather{
    constructor(weatherBlock, server, city){
        this.weatherBlock = weatherBlock;
        this.server = server;
        this.city = city;
    }

    async loadweather(e){    
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
        console.log(data);
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

}

//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=bfa3a7ce18d4bf2802239bd30542e93e

let london = new Weather(weatherBlock, "https://api.openweathermap.org/data/2.5/weather?lat=51.5085&lon=-0.1257&appid=bfa3a7ce18d4bf2802239bd30542e93e", "London");
let newYork = new Weather(weatherBlock, "https://api.openweathermap.org/data/2.5/weather?lat=43.0004&lon=-75.4999&appid=bfa3a7ce18d4bf2802239bd30542e93e", "New York");
let kyiv = new Weather(weatherBlock, "https://api.openweathermap.org/data/2.5/weather?lat=50.4333&lon=30.5167&appid=bfa3a7ce18d4bf2802239bd30542e93e", "Kyiv");

if(weatherBlock) {
    london.loadweather();
    newYork.loadweather();
    kyiv.loadweather();
}

btnForCity.addEventListener("click", function() {
        if (cityInput.value){
        let server = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput.value}&limit=5&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
        loadcity(cityInput.value);
        async function loadcity(e){    
            const response = await fetch(server, {
                method: "GET",
            });
            const responseResult = await response.json();
            if (response.ok) {
                for (let i = 0; i < responseResult.length; i++){
                    if (cityInput.value == responseResult[i].name){
                        let link = `https://api.openweathermap.org/data/2.5/weather?lat=${responseResult[i].lat}&lon=${responseResult[i].lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
                        new Weather(weatherBlock, link, cityInput.value).loadweather();
                    }
                }
            } else {this.createElement(responseResult.message);}
        }
    }
    });

