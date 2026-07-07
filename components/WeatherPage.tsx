import React, { useState, useEffect, useMemo } from 'react';
import { MenuIcon, SunIcon, CloudIcon, RainIcon, StormIcon, PartlyCloudyIcon, WarningIcon, ThermometerIcon, WindIcon, HumidityIcon, SunriseIcon, SunsetIcon, UvIndexIcon, SoilMoistureIcon, GddIcon, EvapotranspirationIcon } from '../constants';
import type { FarmLocation, AllWeatherData, WeatherAlert, HourlyForecastData, DailyForecastData } from '../types';

// --- MOCK API DATA ---
// This data simulates a response from OpenWeatherMap's One Call API 3.0
// In a real application, you would replace `fetchMockWeatherData` with a real API call.
const MOCK_WEATHER_DATA: AllWeatherData = {
  current: {
    dt: 1678886400,
    sunrise: 1678855200,
    sunset: 1678898400,
    temp: 28.5,
    feels_like: 32.1,
    humidity: 78,
    uvi: 11.5,
    clouds: 40,
    wind_speed: 15.2,
    wind_deg: 210,
    weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
    rain: { '1h': 0.5 },
  },
  hourly: Array.from({ length: 48 }, (_, i) => ({
    dt: 1678886400 + i * 3600,
    temp: 28.5 - Math.sin(i / 48 * Math.PI * 2) * 5 + Math.random() * 2 - 1,
    weather: i > 5 && i < 8 ? [{ id: 501, main: 'Rain', description: 'moderate rain', icon: '10d' }] : [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
    pop: i > 5 && i < 8 ? 0.8 : (i > 20 && i < 24 ? 0.2 : 0.05),
  })),
  daily: Array.from({ length: 8 }, (_, i) => ({
    dt: 1678886400 + i * 86400,
    sunrise: 1678855200 + i * 86400,
    sunset: 1678898400 + i * 86400,
    temp: {
      day: 32.5 - i,
      min: 24.5 - i,
      max: 33.5 - i,
    },
    weather: i === 2 ? [{ id: 211, main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' }] : [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
    pop: 0.6 + i * 0.05,
    rain: 5.5 + i,
  })),
  alerts: [
    {
      sender_name: 'National Weather Service',
      event: 'High Wind Warning',
      start: 1678900000,
      end: 1678943200,
      description: 'A high wind warning is in effect. Expect sustained winds of 40-50 km/h with gusts up to 80 km/h. Secure loose objects and exercise caution when driving high-profile vehicles.',
    },
  ],
  agricultural: {
    soil_temp: 26.2,
    soil_moisture: 65.3,
    gdd: 120.5,
    et: 4.8,
  },
};


// In a real app, you would fetch this from an API.
const fetchMockWeatherData = (lat: string, lon: string): Promise<AllWeatherData> => {
  console.log(`Fetching mock weather data for lat: ${lat}, lon: ${lon}`);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_WEATHER_DATA);
    }, 1000); // Simulate network delay
  });
};


// --- Helper Functions ---
const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const getWindDirection = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
};
const getWeatherIcon = (iconCode: string, className?: string) => {
    const code = iconCode.slice(0, 2); // Use first two chars for general condition
    switch (code) {
        case '01': return <SunIcon className={className} />;
        case '02': return <PartlyCloudyIcon className={className} />;
        case '03':
        case '04': return <CloudIcon className={className} />;
        case '09':
        case '10': return <RainIcon className={className} />;
        case '11': return <StormIcon className={className} />;
        // case '13': return <SnowIcon className={className} />; // Snow icon if needed
        // case '50': return <MistIcon className={className} />; // Mist/fog icon if needed
        default: return <CloudIcon className={className} />;
    }
};

// --- Sub-components ---

const AlertBanner = ({ alert }: { alert: WeatherAlert, key?: React.Key }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
        <div className="flex">
            <div className="py-1"><WarningIcon className="h-6 w-6 text-red-500 mr-4"/></div>
            <div>
                <p className="font-bold">{alert.event}</p>
                <p className="text-sm">{alert.description}</p>
                <p className="text-xs mt-2 font-semibold">From: {formatTime(alert.start)} To: {formatTime(alert.end)}</p>
            </div>
        </div>
    </div>
);

const DataWidget = ({ title, value, unit, icon }: { title: string, value: string | number, unit?: string, icon: React.ReactNode }) => (
    <div className="flex items-center space-x-3">
        <div className="text-blue-600">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-800">
                {value}
                {unit && <span className="text-sm font-medium text-gray-600 ml-1">{unit}</span>}
            </p>
        </div>
    </div>
);

// --- Main Page Component ---
const WeatherPage = ({ setSidebarOpen, farmLocations }: { setSidebarOpen: (isOpen: boolean) => void; farmLocations: FarmLocation[] }) => {
    const [selectedLocation, setSelectedLocation] = useState<FarmLocation | null>(farmLocations[0] || null);
    const [weatherData, setWeatherData] = useState<AllWeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedLocation) {
            setIsLoading(true);
            setError(null);
            
            // --- REAL API CALL WOULD GO HERE ---
            // Replace `fetchMockWeatherData` with your actual API call function.
            // const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
            // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&exclude=minutely&appid=${API_KEY}&units=metric`;
            // fetch(url)
            //   .then(response => response.json())
            //   .then(data => {
            //      // You might need to add the mocked 'agricultural' data manually if the API doesn't provide it
            //      data.agricultural = MOCK_WEATHER_DATA.agricultural; 
            //      setWeatherData(data);
            //   })
            //   .catch(err => setError('Failed to fetch weather data.'))
            //   .finally(() => setIsLoading(false));
            
            // Using mocked data for now:
            fetchMockWeatherData(selectedLocation.lat, selectedLocation.lon)
                .then(data => setWeatherData(data))
                .catch(() => setError('Failed to fetch weather data.'))
                .finally(() => setIsLoading(false));
        }
    }, [selectedLocation]);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const location = farmLocations.find(loc => String(loc.id) === e.target.value);
        setSelectedLocation(location || null);
    };
    
    if (isLoading) {
        return (
             <main className="flex-1 w-full p-4 md:p-8 bg-slate-100 flex items-center justify-center">
                 <div className="text-center">
                    <p className="text-lg font-semibold text-gray-600">Loading Weather Data...</p>
                 </div>
             </main>
        );
    }
    
    if (error || !weatherData) {
        return (
             <main className="flex-1 w-full p-4 md:p-8 bg-slate-100 flex items-center justify-center">
                 <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-red-600">Error</h3>
                    <p className="text-gray-700 mt-2">{error || 'Could not load weather data for the selected location.'}</p>
                 </div>
             </main>
        );
    }

    const { current, hourly, daily, alerts, agricultural } = weatherData;

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Farm Weather Center</h2>
                    <select
                        value={selectedLocation?.id || ''}
                        onChange={handleLocationChange}
                        className="mt-2 text-sm font-semibold text-gray-600 bg-transparent border-0 focus:ring-0 p-0"
                    >
                        {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>

            <div className="space-y-8">
                {alerts && alerts.map((alert, index) => (
                    // FIX: Added a unique key prop to the AlertBanner component.
                    <AlertBanner key={index} alert={alert} />
                ))}

                {/* Current Conditions & Agri Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                         <h3 className="font-bold text-lg text-gray-800">Right Now</h3>
                         <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
                            <div className="flex items-center space-x-4">
                                {getWeatherIcon(current.weather[0].icon, 'h-24 w-24')}
                                <div>
                                    <p className="text-6xl font-bold text-gray-800">{Math.round(current.temp)}°C</p>
                                    <p className="font-semibold text-gray-600 capitalize">{current.weather[0].description}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DataWidget title="Feels Like" value={`${Math.round(current.feels_like)}°`} icon={<ThermometerIcon />} />
                                <DataWidget title="Wind" value={`${current.wind_speed.toFixed(1)} km/h`} unit={getWindDirection(current.wind_deg)} icon={<WindIcon />} />
                                <DataWidget title="Humidity" value={`${current.humidity}%`} icon={<HumidityIcon />} />
                                <DataWidget title="UV Index" value={current.uvi.toFixed(1)} icon={<UvIndexIcon />} />
                                <DataWidget title="Sunrise" value={formatTime(current.sunrise)} icon={<SunriseIcon />} />
                                <DataWidget title="Sunset" value={formatTime(current.sunset)} icon={<SunsetIcon />} />
                            </div>
                         </div>
                    </div>
                     <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Agricultural Dashboard</h3>
                        <div className="space-y-4">
                           <DataWidget title="Soil Temperature (10cm)" value={agricultural.soil_temp.toFixed(1)} unit="°C" icon={<ThermometerIcon />} />
                           <DataWidget title="Soil Moisture" value={agricultural.soil_moisture.toFixed(1)} unit="%" icon={<SoilMoistureIcon />} />
                           <DataWidget title="Growing Degree Days (GDD)" value={agricultural.gdd.toFixed(1)} icon={<GddIcon />} />
                           <DataWidget title="Evapotranspiration (ET)" value={agricultural.et.toFixed(1)} unit="mm/day" icon={<EvapotranspirationIcon />} />
                        </div>
                    </div>
                </div>
                
                {/* Hourly Forecast */}
                <div className="bg-white rounded-xl shadow-md p-6">
                     <h3 className="font-bold text-lg text-gray-800 mb-4">Hourly Forecast (Next 48 Hours)</h3>
                     <div className="flex space-x-4 overflow-x-auto pb-4">
                        {hourly.map(hour => (
                            <div key={hour.dt} className="flex-shrink-0 w-24 text-center p-3 bg-gray-50 rounded-lg border">
                                <p className="text-sm font-semibold text-gray-800">{formatTime(hour.dt)}</p>
                                <div className="my-2 flex justify-center">{getWeatherIcon(hour.weather[0].icon, 'h-8 w-8')}</div>
                                <p className="text-lg font-bold text-gray-900">{Math.round(hour.temp)}°C</p>
                                {hour.pop > 0.1 && <p className="text-xs text-blue-600 font-semibold mt-1">{(hour.pop * 100).toFixed(0)}% Rain</p>}
                            </div>
                        ))}
                     </div>
                </div>

                {/* Daily Forecast */}
                <div className="bg-white rounded-xl shadow-md p-6">
                     <h3 className="font-bold text-lg text-gray-800 mb-4">7-Day Forecast</h3>
                     <div className="space-y-2">
                        {daily.slice(1).map(day => (
                            <div key={day.dt} className="grid grid-cols-4 sm:grid-cols-6 items-center p-2 rounded-lg hover:bg-gray-50">
                                <p className="font-bold text-gray-800 col-span-1 sm:col-span-2">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                <div className="flex items-center space-x-2 col-span-1">
                                    {getWeatherIcon(day.weather[0].icon, 'h-8 w-8')}
                                    <p className="text-sm text-gray-600 hidden sm:block capitalize">{day.weather[0].main}</p>
                                </div>
                                <p className="text-sm text-blue-600 font-semibold text-center col-span-1">{(day.pop * 100).toFixed(0)}% Rain</p>
                                <p className="text-sm text-gray-500 text-right col-span-1 sm:col-span-1">{Math.round(day.temp.min)}°</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2 hidden sm:block col-span-1">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                                <p className="text-sm font-bold text-gray-800 text-left col-span-1 sm:col-span-1">{Math.round(day.temp.max)}°</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </main>
    );
};

export default WeatherPage;