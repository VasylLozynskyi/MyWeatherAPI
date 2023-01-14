const weatherBlock = document.querySelector("#weather");
const cityInput = document.querySelector("#cityValue");
const btnForCity = document.querySelector(".btn");
const radioEl = document.querySelectorAll(`input[type="radio"]`);

class Weather{
    constructor(weatherBlock, city, server, lat, lon){
        this.weatherBlock = weatherBlock; // html element where appends blocks weather which created
        this.server = server; // url for get data from api
        this.city = city; // name city in en lenguage 
        this.lon = lon; // coord longitude
        this.lat = lat; // coord latitude
        this.cikle = false;
    }
        // loaded data from server api.openweathermap.org
    async loadweather(checkCoords){ 
        const response = await fetch(this.server, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
            console.log(responseResult);
                if(this.city == responseResult.name){
                    if(checkCoords){// check if input city in other lenguage then english
                        // save coords if user input name city in other lenguage then english
                        this.lat = responseResult.coord.lat; 
                        this.lon = responseResult.coord.lon;
                    }
                    this.getWeather(responseResult); //start create weather block
                } 
        } else {
            this.createEl(responseResult.message); // start rendering error message if not get data
        }
    }
    // create weather block
    getWeather(data) {
        const location = data.name; //name city
        const country = data.sys.country; // in what country is this city
        const temp = +Math.round(data.main.temp - 273.15); // current temperature
        const feelsLike = +Math.round(data.main.feels_like - 273.15); // current feels_like temperature
        const weatherStatus = data.weather[0].description; // current status weather (ex.: rain, clouds, clear)
        const weahterIcon = data.weather[0].icon; // get icon  status weather
        const wind = data.wind.speed; // current speed wind
        const humidity = data.main.humidity; 
        const pressure = data.main.pressure;
        // create template for HTML Element block weather
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
        <div>
            <img class="temper-icon" src="./img/temperature_icon.png" alt="temperature_icon" >
            <div class="temperature">${temp}</div>
            <p>°C</p>
        </div>
        <div>
            <div class="textContent-feels-like">Feels like: </div>
            <div class="feels-like">${feelsLike}</div>
            <p>°C</p>
        </div>
        <div class="wind block">Wind: ${wind}m/s</div>
        <div class="humidity block">Humidity: ${humidity}%</div>
        <div class="pressure block">Pressure: ${pressure}hPa</div>`;
        
        this.createEl(template, weatherStatus); // call function rendering weather block
        //°C
    }
    // rendering weather block
    createEl(value, weatherStatus) {
        let newEl = document.createElement("div");
        //look if we have error message
       if (value == "Nothing to geocode"){
            newEl.classList.add("notFindCity");
            newEl.innerHTML = `${value}<br>Server coudn't found <b>${this.city}</b> city`; // error message set into weather block we rendering
        } else {
            newEl.innerHTML = value;
            newEl.append(this.createBtns());  //rendering with call function which create buttons(forecast and details)
        }
        let some = "../img/background.jpg";
        let color = "black";

        switch (weatherStatus) {
            case "moderate rain":
                some = "../img/moderate_rain.webp";
                //color = "white";
                break;
            case "light rain":
                some = "../img/light_rain.jpg";
                break;
            case "few clouds":
                some = "../img/few_clouds.jpg";
                break;
            case "overcast clouds":
                some = "../img/overcast_clouds.jpg";
                break;
            case "broken clouds":
                some = "../img/broken_clouds.jpg";
                break;
            case "scattered clouds":
                some = "../img/";
                break;
            case "clear sky":
                some = "../img/clear_sky.jpg";
                break;
            case "mist":
                some = "../img/mist.jpg";
                break;
            case "snow":
                some = "../img/snow.jpg";
                break;
            default:
                break;
        }
        console.log(this.weatherBlock);
        this.weatherBlock.style.backgroundImage = `url("${some}")`;
        newEl.style.color = color;
        this.weatherBlock.append(newEl); // rendering weather block with data-template
    

        
    }
    // create (forecast and moreDetails buttons)
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
            // find html element to toggle for datas
           const wind = this.parentElement.parentElement.querySelector(".wind");
           const humidity = this.parentElement.parentElement.querySelector(".humidity");
           const pressure = this.parentElement.parentElement.querySelector(".pressure");
           //change with onkclick button moredetails class for rendering some more datas
           wind.classList.toggle("block");
           humidity.classList.toggle("block");
           pressure.classList.toggle("block");
        });
        let popBg = document.createElement("div");
        popBg.classList.add("popup");
        popBg.classList.add("hidden")
        btnForecast.addEventListener("click", () =>{
            popBg.classList.toggle("hidden");
            this.forecast5Days(popBg); // call function after click on button to open pop-up with forecast
        });
        // rendering buttons
        div.append(btnForecast);
        div.append(btnDetails);
        return div;
    }
    // looking for data from api.openweathermap.org for only name city to find coords
    // if don't get some data from file
    // this need if user enter name city in other lenguage then english
    async loadcity(){
        if (this.lon == undefined && this.lat == undefined){ // check coords
            let getCoordsFromServer = `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=10&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
            const response = await fetch(getCoordsFromServer, {
                method: "GET",
            });
            const responseResult = await response.json();
            if (response.ok) {
                let checkCoords = false;
                for (let i = 0; i < responseResult.length; i++){
                    checkCoords = false;
                    if (responseResult[i].local_names != undefined) {// check data-object have city names unit languages
                        if (Object.values(responseResult[i].local_names).indexOf(this.city) > -1){ // check if found in object-data unit lenguages any name city
                            this.city = responseResult[i].local_names.en; // save city in en lenguage
                            checkCoords = true;
                            if (!this.cikle){
                            this.cikle = true;
                            this.findCity();
                            break;
                            } else {
                            let loading = document.querySelector(".loading"); //catch html element gif loading
                            if (loading) loading.parentElement.remove(); //check if is - remove
                             //save url to api.openweathermap.org to get data
                             this.server = `https://api.openweathermap.org/data/2.5/weather?lat=${responseResult[i].lat}&lon=${responseResult[i].lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
                            // this.cikle = false;
                             this.loadweather(checkCoords);
                            }
                        }
                    }
                }
            } else {this.createEl(responseResult.message);} // send message if can't reed server
        } else {
            let loading = document.querySelector(".loading"); //catch html element gif loading
            if (loading) loading.parentElement.remove(); //check if is - remove
            this.server = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
            this.loadweather();
        }
        
    }
    // function look to find object in file which load from api.openweathermap.org free version
    async findCity(){
        // rendering gif for wait done looking for object with needed name of city
        let loading = document.querySelector(".loading"); //catch html element gif loading
        if (loading == null){
            let temp = document.createElement("div");
            temp.innerHTML = `
            <div class="loading">
                <img src="./img/Loading_icon.gif" alt="loading-gif">
            </div> `;
            this.weatherBlock.innerHTML = "";
            this.weatherBlock.append(temp);
        }
        let fileCities = "./cities/city.list.json"; // link for file (file have only en lenguages names city)
        const response = await fetch(fileCities, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
        for (let i = 0; i < responseResult.length; i++) {
                if (this.city == responseResult[i].name){ // checked input value (city name) with data city name in objects found in file
                    // save coords if find in file data
                    this.lon = responseResult[i].coord.lon; 
                    this.lat = responseResult[i].coord.lat;
                    this.loadcity();
                    break;
                }
        }
        if (this.lon == undefined && this.lat == undefined) { // call function even if don't found city in file
            this.loadcity();
            }
        }
    }
    
    // catch url to api to get data forecast to 5 days
    async forecast5Days(popBg) {
        let forecast5Days = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=bfa3a7ce18d4bf2802239bd30542e93e`;
        const response = await fetch(forecast5Days, {
            method: "GET",
        });
        const responseResult = await response.json();
        if (response.ok) {
             let popup = new PopupForecast(responseResult); //create custom pop-up
             popup.show(popBg);
        } else {
            console.log(responseResult.message);
        }
    }
}
// create class for pop-up block
class PopupForecast{
    constructor(data){
        this.data = data; // data from server api
    }
    // rendering pop-up block forecast
    show(popBg){
        if (popBg.innerHTML == ""){
        let p = document.querySelector(".buttons");
        // create and rendering 5 blocks as 5 days info weather
        for (let i = 4; i < this.data.list.length; i = i+8) {
            //create block
            const el = this.data.list[i]; // catch data
            let date = new Date(el.dt_txt); // catch date in current data
            let options = { weekday: 'long'}; // for transform index week day to name day of week
            const template = `
        <div class="weather-popup">
            <div class="main-popup">
                <div class="date">${new Intl.DateTimeFormat('en-US', options).format(date)}</div>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${el.weather[0].icon}.png" alt="${el.weather[0].icon}">
                <div class="status">${el.weather[0].description}</div>
            </div>
        </div>
        <div>
            <div>
                <div class="temperature">${Math.round(el.main.temp - 273,15)}</div>
                <p>°C</p>
            </div>
            <div>
                <div class="textContent-feels-like">Feels like: </div>
                <div class="feels-like">${Math.round(el.main.feels_like - 273,15)}</div>
                <p>°C</p>
            </div>
        </div>`;
        //rendering block
        let div = document.createElement("div");
        div.classList.add("flex-forecast")
        div.innerHTML = template;
        popBg.append(div);
        }
        p.insertAdjacentElement("afterend", popBg);
    }
}
}

// simple add cities default
// let london = new Weather(weatherBlock,"London", "https://api.openweathermap.org/data/2.5/weather?lat=51.5085&lon=-0.1257&appid=bfa3a7ce18d4bf2802239bd30542e93e", 51.5085, -0.1257);
// let newYork = new Weather(weatherBlock, "New York", "https://api.openweathermap.org/data/2.5/weather?lat=43.0004&lon=-75.4999&appid=bfa3a7ce18d4bf2802239bd30542e93e", 43.0004, -75.4999);
let link = new Weather(weatherBlock, "Kyiv", "https://api.openweathermap.org/data/2.5/weather?lat=50.4333&lon=30.5167&appid=bfa3a7ce18d4bf2802239bd30542e93e", 50.4333, 30.5167);

if(weatherBlock) {  // look  if element weatherblock is call methods for cities default
    // london.loadweather(true); // true because have coords in default
    // newYork.loadweather(true);
    link.loadweather(true);
}
// look if user write correct input value as a name of city
function checkedCity() {
    if (cityInput.value){ // look if in value input is somethisng
        // function getFirstLetters(str) { // function which get first Letter of city
        //     const firstLetters = str
        //       .split(' ')
        //       .map(word => word[0])
        //       .join('')
        //       .toUpperCase();
        //     return firstLetters;
        // }
        //let letter = getFirstLetters(cityInput.value); // call function for get first letter
        cityInput.value = cityInput.value.charAt(0).toUpperCase() + cityInput.value.slice(1)
        if (isNaN(cityInput.value)){ // if input value user write number
            //let link = new Weather(weatherBlock, cityInput.value); // add custom class 
            link.city = cityInput.value;
            link.lat = undefined;
            link.lon = undefined;
            link.cikle = false;
            link.findCity(); //call in custom class method
            cityInput.value = ""; // reset input
        } else { // show error message for big first letter
            cityInput.nextElementSibling.textContent = "Enter correct city not a number";
            cityInput.style.border = "0.5px solid red";
        }
    } else { // show error message if value input have nothing
        cityInput.nextElementSibling.textContent = "Please enter a city";
        cityInput.style.border = "0.5px solid red";
    }
}
//converse temperature (°C, °K, °F) after change input radio buttons
function getValueTemperature(value, previousValue) {
    const divsTemperature = document.querySelectorAll(".temperature");
    const divsFeelTemperature = document.querySelectorAll(".feels-like");
    divsTemperature.forEach(el => {
        conversationTemperature(value, previousValue, el);
    });
    divsFeelTemperature.forEach(el => {
        conversationTemperature(value, previousValue, el);
    });
}
// function custom conversation temperature
function conversationTemperature (value, previousValue, el) {
    switch (value) {
        case "farenheit":
            if (previousValue == "celsius") {
            el.textContent = ((+el.textContent * 9 / 5) + 32).toFixed(1);
            el.nextElementSibling.textContent = `°F`;
            break;
            } else if (previousValue == "kelvin"){
                el.textContent = (((+el.textContent - 273.15) * 9 / 5) + 32).toFixed(1);
                el.nextElementSibling.textContent = `°F`;
                break;
            } else {
                break;
            }
        case "kelvin":
            if (previousValue == "celsius") {
                el.textContent = (+el.textContent + 273.15).toFixed(2);
                el.nextElementSibling.textContent = `°K`;
                break;
                } else if (previousValue == "farenheit"){
                    el.textContent = (((+el.textContent - 32) * 5 / 9) + 273.15).toFixed(2);
                    el.nextElementSibling.textContent = `°K`;
                    break;
                } else {
                    break;
                }
        case "celsius":
            if (previousValue == "kelvin") {
                el.textContent = (+el.textContent - 273.15).toFixed(0);
                el.nextElementSibling.textContent = `°C`;
                break;
                } else if (previousValue == "farenheit"){
                    el.textContent = ((+el.textContent - 32) * 5 / 9).toFixed(0);
                    el.nextElementSibling.textContent = `°C`;
                    break;
                } else {
                    break;
                }
    }
}
// out of range input reset input if click any place in window
window.addEventListener("mousedown", function (e) {
    cityInput.nextElementSibling.textContent = "";
        cityInput.style.border = "none";
});
// call function if press on keyboard "Enter" on window space
window.addEventListener("keydown", function (e) {
    if (e.code == "Enter") { // look for press keyboard
        checkedCity();
    }
});
// event for click button  = window keyboard press "Enter"
btnForCity.addEventListener("click", function() {
    checkedCity();
});

radioEl.forEach(el => {
    let previousElValue;
    if (el.checked) {
        el.dataset.last = true;
    }
    el.addEventListener("change", () =>{
        previousElValue = document.querySelector('input[data-last="true"]').dataset.temperature;
        document.querySelector('input[data-last="true"]').dataset.last = false;
        document.querySelector('input[name="temperature"]:checked').dataset.last = true;
        getValueTemperature(document.querySelector('input[name="temperature"]:checked').dataset.temperature, previousElValue);
    });
});