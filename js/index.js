// Radio button --------------------------------------------------------------------------------------------------------
const inputText = document.getElementById("inputText");
const radioButtons = document.querySelectorAll('input[type="radio"]');

radioButtons.forEach(radio => {
  radio.addEventListener('change', (event) => {
    inputText.value = '';
    errorMessage.textContent = '';
    if (event.target.value === 'coordinates') {
      inputText.placeholder = "Enter coords (23.34, -12.3)";
    } else {
      inputText.placeholder = "Enter city name";
    }
  });
});

// Find city and its data ----------------------------------------------------------------------------------------------
const API_KEY = 'a27ea71044824c9e97695934251602';
const searchButton = document.getElementById("search-button");
const tempOutput = document.querySelector(".temp");
const realTempOutput = document.querySelector(".real-feel");
const dateOutput = document.querySelector(".date");
const cityOutput = document.querySelector(".city");
const imgOutput = document.getElementById("weather-img");
const humidityOutput = document.querySelector(".humidity p");
const windOutput = document.querySelector(".wind p");
const pressureOutput = document.querySelector(".pressure p");
const errorMessage = document.getElementById("error-message");
const weatherCards = document.getElementById("weather-cards");
const nextDayWeatherCardsOutput = document.querySelector(".weather-next-days");

async function getWeather(location) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        reject(new Error(`Error: ${xhr.statusText}`));
      }
    };
    xhr.onerror = function () {
      reject(new Error('Network error'));
    };
    xhr.open("GET", `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&lang=en`, true);
    xhr.send();
  });
}

async function getWeatherForSevenDays(location) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        reject(new Error(`Error: ${xhr.statusText}`));
      }
    };
    xhr.onerror = function () {
      reject(new Error('Network error'));
    };
    xhr.open("GET", `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&lang=en`, true);
    xhr.send();
  });
}

function updateUI(data) {
  if (!data) return;
  console.log(data);
  const { location, current } = data;
  cityOutput.textContent = location.name;
  tempOutput.textContent = `${current.temp_c} °C`;
  realTempOutput.textContent = `Real feel: ${current.feelslike_c} °C`;
  dateOutput.textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  imgOutput.src = `https:${current.condition.icon}`;
  humidityOutput.innerHTML = `<b>Humidity:</b><br> ${current.humidity}%`;
  windOutput.innerHTML = `<b>Wind speed:</b><br> ${current.wind_kph} km/h`;
  pressureOutput.innerHTML = `<b>Pressure:</b><br> ${current.pressure_mb} hPa`;

  errorMessage.style.display = 'none';
}

function createWeatherCard(time, icon, temp, condition) {
  return `
    <div class="weather-card">
      <p>${time}</p>
      <img src="${icon}" alt="${condition}">
      <p>${temp} °C</p>
      <p>${condition}</p>
    </div>
  `;
}

function updateDaysUI(data) {
  weatherCards.innerHTML = '';
  nextDayWeatherCardsOutput.innerHTML = '';

  data.forecast.forecastday.forEach((day, index) => {
    if (index === 0) {
      day.hour.forEach(hour => {
        const time = new Date(hour.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const icon = `https:${hour.condition.icon}`;
        const temp = hour.temp_c;
        const condition = hour.condition.text;
        const cardHTML = createWeatherCard(time, icon, temp, condition);
        weatherCards.insertAdjacentHTML('beforeend', cardHTML);
      });
    } else {
      const weekday = new Date(day.date).toLocaleDateString('en-GB', {
        weekday: 'long',
      });
      const date = new Date(day.date).toLocaleDateString('en-GB', {
        month: 'long',
        day: 'numeric',
      });
      const icon = `https:${day.day.condition.icon}`;
      const temp = day.day.avgtemp_c;
      const condition = day.day.condition.text;

      const nextDay = `
        <div class="next-day">
          <p>${weekday}</p>
          <p>${date}</p>
          <img src="${icon}" alt="${condition}">
          <p>${temp} °C</p>
          <p>${condition}</p>
        </div>
      `;
      nextDayWeatherCardsOutput.insertAdjacentHTML('beforeend', nextDay);
    }
  });
}

searchButton.addEventListener('click', () => {
  const location = inputText.value.trim();
  inputText.value = '';
  errorMessage.textContent = '';

  if (!location) {
    errorMessage.textContent = 'Please, input coordinates or city name.';
    errorMessage.style.display = 'block';
    return;
  }

  getWeather(location)
      .then((weatherData) => {
        updateUI(weatherData);
        document.querySelector('.weather-block-temp').style.display = 'flex';
        document.querySelector('.weather-h-w-p').style.display = 'block';
        document.querySelector('.weather-today').style.display = 'block';
        document.querySelector('.weather-block').style.display = 'block';
        document.querySelector('.map').style.display = 'block';
      })
      .catch((error) => {
        console.error('Error:', error);
        errorMessage.textContent = 'Coordinates or city name not found. Please try again.';
        errorMessage.style.display = 'block';
      });

  getWeatherForSevenDays(location)
      .then((weatherData) => {
        updateDaysUI(weatherData);
      })
      .catch((error) => {
        console.log('Error', error);
        errorMessage.textContent = 'Coordinates or city name not found. Please try again.';
        errorMessage.style.display = 'block';
      });
});
