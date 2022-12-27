const weatherBlock = document.querySelector("#weather");
const cityInput = document.querySelector("#cityValue");
const btnForCity = document.querySelector(".btn");

class Weather{
    constructor(weatherBlock, city, server,){
        this.weatherBlock = weatherBlock;
        this.server = server;
        this.city = city;
        this.lon = 0;
        this.lat = 0;
    }

    async loadweather(){ 
        const response = await fetch(this.server, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            console.log(responseResult.name);
                if(this.city == responseResult.name){
                    this.getWeather(responseResult);
                } 
        } else {
            this.createEl(responseResult.message);
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
        <div class="buttons">
            <button class="btn btn-forecast">Forecast 5 days</button>
            <button class="btn btn-moreDetail">more details</button>
        </div>
        <div class="temperature">${temp}°C</div>
        <div class="feels-like">Feels like: ${feelsLike}°C</div>`;
        this.createEl(template);
    }
    createEl(value) {
        let newEl = document.createElement("div");
       if (value == "Nothing to geocode"){
            newEl.classList.add("notFindCity");
            newEl.innerHTML = `${value}<br>Server coudn't found <b>${this.city}</b> city`;
        } else newEl.innerHTML = value;
        let btnRemove = document.createElement("button");
        btnRemove.classList.add("btn", "btn-remove");
        btnRemove.textContent = "Remove";
        btnRemove.addEventListener("click", () => {
            this.parentElement.parentElement.remove();
        });
        newEl.append(btnRemove);
        this.weatherBlock.append(newEl);
    }
    async loadcity(){
        let loading = document.querySelector(".loading");
        if (loading) loading.parentElement.remove();
        if (this.lon == 0 && this.lat == 0){
            let getLatLonFromServer = `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=10&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
            const response = await fetch(getLatLonFromServer, {
                method: "GET",
            });
            const responseResult = await response.json();
            if (response.ok) {
                for (let i = 0; i < responseResult.length; i++){
                    if (responseResult[i].local_names != undefined) {
                        if (Object.values(responseResult[i].local_names).indexOf(this.city) > -1){
                            this.city = responseResult[i].local_names.en;
                            this.lat = responseResult[i].lat;
                            this.lon = responseResult[i].lon;
                            this.server = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
                            this.loadweather();
                        }
                    }
                }
                if (this.lon == 0 && this.lat == 0) {
                    this.createEl("Nothing to geocode");
                }
            } else {this.createEl(responseResult.message);}
        } else {
            this.server = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
            this.loadweather();
        }
        
    }
    async findCity(){
        let temp = document.createElement("div");
        temp.innerHTML = `
        <div class="loading">
            <img src="./img/Loading_icon.gif" alt="loading-gif">
        </div> `;
        this.weatherBlock.append(temp);
        let fileCities = `./cities/city.list.json`;
        const response = await fetch(fileCities, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            for (let i = 0; i < responseResult.length; i++) {
                if (this.city == responseResult[i].name){
                    this.lon = responseResult[i].coord.lon;
                    this.lat = responseResult[i].coord.lat;
                    this.loadcity();
                }
            }
            if (this.lon == 0 && this.lat == 0) {
                this.loadcity();
            }

        } else {this.createEl(responseResult.message);}
    }
    async weatherFor5Days() {
        let weatherFor5Days = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
        const response = await fetch(weatherFor5Days, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            console.log(responseResult);
               
        } else {
            console.log(responseResult.message);
        }
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

function checkedCity() {
    if (cityInput.value){
        function getFirstLetters(str) {
            const firstLetters = str
              .split(' ')
              .map(word => word[0])
              .join('');
            return firstLetters;
        }
        let letter = getFirstLetters(cityInput.value);
        if(letter === letter.toUpperCase() && isNaN(cityInput.value)){
            let link = new Weather(weatherBlock, cityInput.value);
            link.findCity();
            cityInput.value = "";
        } else alert("Enter correct city with big first letter");
        
        
    } else alert("Please enter a city");
}

window.addEventListener("keydown", function (e) {
    if (e.code == "Enter") {
        checkedCity();
    }
});

btnForCity.addEventListener("click", function() {
    checkedCity();
});