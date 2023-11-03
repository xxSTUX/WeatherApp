const key = '64c8c171654f3e9bf1880c4cfd45e608';
const requestCity = async (city) => {
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`;

  try {
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    const forecastResponse = await fetch(forecastUrl);

    if (!currentWeatherResponse.ok) {
      throw new Error(`Error en la solicitud: ${currentWeatherResponse.status}`);
    }

    if (!forecastResponse.ok) {
      throw new Error(`Error en la solicitud: ${forecastResponse.status}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    return { current: currentWeatherData, forecast: forecastData.list };
  } catch (error) {
    // Manejar errores
    console.error('Error en la solicitud:', error);
    throw error;
  }
};