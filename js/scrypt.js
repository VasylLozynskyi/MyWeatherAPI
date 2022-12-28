const weatherBlock = document.querySelector("#weather");
const cityInput = document.querySelector("#cityValue");
const btnForCity = document.querySelector(".btn");

class Weather{
    constructor(weatherBlock, city, server, lat, lon){
        this.weatherBlock = weatherBlock;
        this.server = server;
        this.city = city;
        this.moreDetails = false;
        this.lon = lon;
        this.lat = lat;
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
        const wind = data.wind.speed;
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
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
        <div class="feels-like">Feels like: ${feelsLike}°C</div>
        <div class="wind block">Wind: ${wind}m/s</div>
        <div class="humidity block">Humidity: ${humidity}%</div>
        <div class="pressure block">Pressure: ${pressure}hPa</div>`;
        
        
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
            btnRemove.parentElement.remove();
        });
        newEl.append(this.createBtns());
        newEl.append(btnRemove);
        this.weatherBlock.append(newEl);
        
    }
    createBtns(){
        let div = document.createElement("div");
        div.classList.add("buttons");
        let btnDetails = document.createElement("button");
        let btnForecast = document.createElement("button");
        btnDetails.classList.add("btn", "btn-moreDetail");
        btnForecast.classList.add("btn", "btn-forecast");
        btnDetails.textContent = "More details";
        btnForecast.textContent = "Forecast 5 days";
        btnDetails.addEventListener("click", function() {
           const wind = this.parentElement.parentElement.querySelector(".wind");
           const humidity = this.parentElement.parentElement.querySelector(".humidity");
           const pressure = this.parentElement.parentElement.querySelector(".pressure");
           wind.classList.toggle("block");
           humidity.classList.toggle("block");
           pressure.classList.toggle("block");
        });
        btnForecast.addEventListener("click", () =>{
            this.forecast5Days();
        });
        div.append(btnForecast);
        div.append(btnDetails);
        return div;
    }
    async loadcity(){
        let loading = document.querySelector(".loading");
        if (loading) loading.parentElement.remove();
        if (this.lon == undefined && this.lat == undefined){
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
                if (this.lon == undefined && this.lat == undefined) {
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
            if (this.lon == undefined && this.lat == undefined) {
                this.loadcity();
            }

        } else {this.createEl(responseResult.message);}
    }
    async forecast5Days() {
        let forecast5Days = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
        const response = await fetch(forecast5Days, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
             let popup = new PopupForecast(responseResult);
             popup.show();
        } else {
            console.log(responseResult.message);
        }
        }
}

class PopupForecast{
    constructor(data){
        this.data = data;
    }
    show(){
        let popBg = document.querySelector(".background-popup");
        let btnClose = popBg.querySelector(".btn-close");
        btnClose.addEventListener("click", function() {
            popBg.style.display = "none";
            main.remove();
            popBg.lastElementChild.innerHTML = "";
        });
        window.addEventListener("click", function(event) {
            if (event.target == popBg) {
                popBg.style.display = "none";
                main.remove();
                popBg.lastElementChild.innerHTML = "";
            }
        });
          
        popBg.style.display = "flex";
        popBg.lastElementChild.style.display = "flex";
        let main = document.createElement("section");
        main.classList.add("header-popup")
        main.innerHTML = `
        <div class="city">${this.data.city.name}</div>
        <div class="country">country: ${this.data.city.country}</div>`;
        popBg.firstElementChild.append(main);
                for (let i = 4; i < this.data.list.length; i = i+8) {
            const el = this.data.list[i];
            let date = new Date(el.dt_txt);
            let options = { weekday: 'long'};
            const template = `
        <div class="weather-header">
            <div class="main">
                <div class="date">${new Intl.DateTimeFormat('en-US', options).format(date)}</div>
            </div>
            <div class="status">${el.weather[0].main}</div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${el.weather[0].icon}.png" alt="${el.weather[0].icon}">
            </div>
        </div>
        <div class="temperature">${Math.round(el.main.temp - 273,15)}°C</div>
        <div class="feels-like">Feels like: ${Math.round(el.main.feels_like - 273,15)}°C</div>`;
        let div = document.createElement("div");
        div.innerHTML = template;
        popBg.lastElementChild.append(div);
        }
    }
}

//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=bfa3a7ce18d4bf2802239bd30542e93e

let london = new Weather(weatherBlock,"London", "https://api.openweathermap.org/data/2.5/weather?lat=51.5085&lon=-0.1257&appid=bfa3a7ce18d4bf2802239bd30542e93e", 51.5085, -0.1257);
let newYork = new Weather(weatherBlock, "New York", "https://api.openweathermap.org/data/2.5/weather?lat=43.0004&lon=-75.4999&appid=bfa3a7ce18d4bf2802239bd30542e93e", 43.0004, -75.4999);
let kyiv = new Weather(weatherBlock, "Kyiv", "https://api.openweathermap.org/data/2.5/weather?lat=50.4333&lon=30.5167&appid=bfa3a7ce18d4bf2802239bd30542e93e", 50.4333, 30.5167);

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