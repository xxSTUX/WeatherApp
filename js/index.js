const searchForm = document.querySelector('.search-location');
const cityValue = document.querySelector('.search-location input');
const cityName = document.querySelector('.city-name p');
const cardBody = document.querySelector('.card-body');
const timeImage = document.querySelector('.card-top img');
const cardInfo = document.querySelector('.back-card');
const forecastCards = document.querySelectorAll('.card.rounded.text-center.pt-4.border-0.back-card.shadow-lg.my-3');


function processDailyForecasts(dailyForecasts) {
  dailyForecasts.forEach((forecast, index) => {
    // Convertir el tiempo del pronóstico (en segundos) a un objeto Date
    const date = new Date(forecast.dt * 1000);
    
    // Formatear la fecha a un string de día
    const options = { weekday: 'long' };
    const day = date.toLocaleDateString('es-ES', options);
    
    // Obtener la temperatura del pronóstico y convertirla a grados Celsius
    const temperatureKelvin = forecast.main.temp;
    const temperatureCelsius = temperatureKelvin - 273.15;

    // Seleccionar el elemento del DOM correcto
    const symbolImg = document.querySelector('.symbol-img' + (index + 1));
    const temperature = document.querySelector('.temp' + (index + 1));

    // Actualizar el nombre del día, la imagen del símbolo y la temperatura
    symbolImg.src = `img/${forecast.weather[0].icon}.png`;
    temperature.innerHTML = `<strong>${temperatureCelsius.toFixed(0)}°C</strong>`;
  });
}

// Función para obtener la ubicación al cargar
function obtenerUbicacionAlCargar() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;


      requestCityByCoordinates(latitud, longitud)
        .then((data) => {
          updateWeatherApp(data.current);
        })
        .catch((error) => {
          console.log(error);
        });
        getForecast(latitud, longitud).then(function (forecast) {
          var forecasts = forecast.list;
          var dailyForecasts = forecasts.filter((forecast, index) => index % 8 === 0);
          processDailyForecasts(dailyForecasts);
          const element = document.querySelector('.container-forecast');
          element.classList.remove('d-none');
        });


    });
  }
}

function getForecast(lat, lon) {
  const key = '64c8c171654f3e9bf1880c4cfd45e608';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  return fetch(forecastUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.log('There was a problem with the fetch operation: ' + error.message);
    });
}
function getForecastByCity(cityName) {
  const key = '64c8c171654f3e9bf1880c4cfd45e608';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${key}`;

  fetch(forecastUrl)
    .then(response => response.json())
    .then(forecast => {
      var forecasts = forecast.list;
      var dailyForecasts = forecasts.filter((forecast, index) => index % 8 === 0);
      processDailyForecasts(dailyForecasts);
    })
    .catch(error => console.log(error));
}



// Escucha el evento "DOMContentLoaded" y obtiene la ubicación
document.addEventListener("DOMContentLoaded", function () {
  obtenerUbicacionAlCargar();
});

// Función para convertir de Kelvin a Celsius
const spitOutCelcius = (kelvin) => {
  celcius = Math.round(kelvin - 273.15);
  return celcius;
};

// Función para determinar si es de día
const isDayTime = (icon) => {
  if (icon.includes('d')) {
    return true;
  } else {
    return false;
  }
};

// Función para solicitar datos de la ciudad por coordenadas
function requestCityByCoordinates(lat, lon) {
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;


  const requests = Promise.all([
    fetch(currentWeatherUrl).then((response) => response.json()),
    fetch(forecastUrl).then((response) => response.json()),
  ]);

  return requests
    .then((data) => {
      console.log('Current Weather Data:', data[0]); // Log current weather data
      console.log('Forecast Data:', data[1]); // Log forecast data
      const [currentWeatherData, forecastData] = data;
      return { current: currentWeatherData, forecast: forecastData.list };
    })
    .catch((error) => {
      console.log(error);
    });
}


// Función para actualizar la información del clima
function updateWeatherApp(city) {
  const imageName = city.weather[0].icon;
  const localIconPath = "img/";
  const iconSrc = `${localIconPath}${imageName}.png`;
  cityName.textContent = city.name;
  cardBody.innerHTML = `
    <div class="card-mid row">
      <div class="col-8 text-center temp">
        <span>${spitOutCelcius(city.main.temp)}&deg;C</span>
      </div>
      <div class="col-4 condition-temp">
        <p class="condition">${city.weather[0].description}</p>
        <p class="high">${spitOutCelcius(city.main.temp_max)}&deg;C</p>
        <p class="low">${spitOutCelcius(city.main.temp_min)}&deg;C</p>
      </div>
    </div>

    <div class="icon-container card shadow mx-auto">
      <img src="${iconSrc}" alt="" />
    </div>
    <div class="card-bottom px-5 py-4 row">
      <div class="col text-center">
        <p>${spitOutCelcius(city.main.feels_like)}&deg;C</p>
        <span>Feels Like</span>
      </div>
      <div class="col text-center">
        <p>${city.main.humidity}%</p>
        <span>Humidity</span>
      </div>
    </div>
  `;
  if (isDayTime(imageName)) {
    timeImage.setAttribute('src', 'img/day_image.png');
    if (cityName.classList.contains('text-white')) {
      cityName.classList.remove('text-white');
    } else {
      cityName.classList.add('text-black');
    }
  } else {
    timeImage.setAttribute('src', 'img/night_image.png');
    if (cityName.classList.contains('text-black')) {
      cityName.classList.remove('text-black');
    } else {
      cityName.classList.add('text-white');
    }
  }
  cardInfo.classList.remove('d-none');
}

// Función para actualizar el pronóstico de 5 días
function updateForecast(forecast) {

  
  if (Array.isArray(forecast)) {
    forecastCards.forEach((card, index) => {
      const dayName = card.querySelector('.text-muted');
      const symbolImg = card.querySelector('.symbol-img');
      const temperature = card.querySelector('strong');

      const date = new Date(forecast[index].dt * 1000);
      const options = { weekday: 'short' };
      dayName.textContent = date.toLocaleDateString('en-US', options);
      symbolImg.src = `img/wn/${forecast[index].weather[0].icon}.png`;
      temperature.innerHTML = `<strong>${spitOutCelcius(forecast[index].main.temp)}&deg;C</strong>`;
    });
  } else {
    console.log("El pronóstico no es un array válido.");
  }
}


// Agregar un evento para el formulario de búsqueda
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const citySearched = cityValue.value.trim();
  searchForm.reset();

  requestCity(citySearched)
    .then((data) => {
      updateWeatherApp(data.current);
      getForecastByCity(citySearched);
      const element = document.querySelector('.container-forecast');
      element.classList.remove('d-none');
    })
    .catch((error) => {
      console.log(error);
    });
});

// Función para actualizar las fechas
function setDays() {
  const today = new Date();
  const options = { weekday: 'short' };

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  document.getElementById('tomorrow').textContent = tomorrow.toLocaleDateString('en-US', options);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  document.getElementById('dayAfterTomorrow').textContent = dayAfterTomorrow.toLocaleDateString('en-US', options);

  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 3);
  document.getElementById('nextDay').textContent = nextDay.toLocaleDateString('en-US', options);

  const secondNextDay = new Date(today);
  secondNextDay.setDate(today.getDate() + 4);
  document.getElementById('secondNextDay').textContent = secondNextDay.toLocaleDateString('en-US', options);

  const thirdNextDay = new Date(today);
  thirdNextDay.setDate(today.getDate() + 5);
  document.getElementById('thirdNextDay').textContent = thirdNextDay.toLocaleDateString('en-US', options);
}

setDays();