

import React, { useEffect, useState, useMemo } from 'react';
import { 
    TOOL_ITEMS, SunIcon, ArrowRightIcon, MenuIcon, UserIcon, 
    PartlyCloudyIcon, CloudIcon, RainIcon, StormIcon, ThermometerIcon, WindIcon, HumidityIcon, 
    UvIndexIcon, SoilMoistureIcon, GddIcon, EvapotranspirationIcon, ArrowUpIcon 
} from '../constants';
import type { ToolItem, UserProfile, FarmLocation, AllWeatherData, BusinessProfile, FinancialDocument, RejectedFinancialDocument, HealthEvent, TeamMember } from '../types';

// --- Weather Card Data & Helpers (Copied from WeatherPage for self-containment) ---

const possibleWeather = [
    { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
    { id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' },
    { id: 803, main: 'Clouds', description: 'broken clouds', icon: '04d' },
    { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
    { id: 211, main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
];

const MOCK_WEATHER_DATA: AllWeatherData = {
  current: {
    dt: 1678886400, sunrise: 1678855200, sunset: 1678898400, temp: 28.5, feels_like: 32.1,
    humidity: 78, uvi: 11.5, clouds: 40, wind_speed: 15.2, wind_deg: 210,
    weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
    rain: { '1h': 0.5 },
  },
  hourly: [], daily: [], 
  agricultural: { soil_temp: 26.2, soil_moisture: 65.3, gdd: 120.5, et: 4.8 }
};

const fetchMockWeatherData = (lat: string, lon: string): Promise<AllWeatherData> => {
  console.log(`Fetching mock weather data for lat: ${lat}, lon: ${lon}`);
  return new Promise(resolve => {
    setTimeout(() => {
      // Deep copy to avoid modifying the original MOCK_WEATHER_DATA for subsequent calls
      const randomizedData = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
      
      randomizedData.current.temp = 25 + Math.random() * 5;
      randomizedData.current.feels_like = randomizedData.current.temp + 3 + Math.random() * 2;
      randomizedData.current.humidity = 70 + Math.random() * 15;
      randomizedData.current.uvi = 9 + Math.random() * 3;
      
      const randomWeather = possibleWeather[Math.floor(Math.random() * possibleWeather.length)];
      randomizedData.current.weather = [randomWeather];

      randomizedData.agricultural.soil_temp = 24 + Math.random() * 4;
      randomizedData.agricultural.soil_moisture = 60 + Math.random() * 10;
      resolve(randomizedData);
    }, 500);
  });
};

const getWindDirection = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
};

const getWeatherIcon = (iconCode: string, className?: string) => {
    const code = iconCode.slice(0, 2); 
    switch (code) {
        case '01': return <SunIcon className={className} />;
        case '02': return <PartlyCloudyIcon className={className} />;
        case '03': case '04': return <CloudIcon className={className} />;
        case '09': case '10': return <RainIcon className={className} />;
        case '11': return <StormIcon className={className} />;
        default: return <CloudIcon className={className} />;
    }
};

const DataWidget = ({ title, value, unit, icon }: { title: string, value: string | number, unit?: string, icon: React.ReactNode }) => (
    <div className="flex items-center space-x-2">
        <div className="text-blue-600">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500">{title}</p>
            <p className="text-base font-bold text-gray-800">
                {value}
                {unit && <span className="text-xs font-medium text-gray-600 ml-1">{unit}</span>}
            </p>
        </div>
    </div>
);


// --- Components ---

const ToolCard = ({ item, onClick, notificationCount }: { item: ToolItem, onClick?: () => void, notificationCount?: number }) => (
    <button 
        onClick={onClick}
        className={`relative ${item.color} text-white p-4 rounded-xl flex flex-col items-center justify-center aspect-[4/3] transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md`}
        disabled={!onClick}
    >
        {notificationCount && notificationCount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {notificationCount}
            </div>
        )}
        <div className="mb-2">{item.icon}</div>
        <span className="text-sm font-semibold text-center leading-tight">{item.name}</span>
    </button>
);

const WeatherCard = ({ onNavigate, farmLocations }: { onNavigate: () => void, farmLocations: FarmLocation[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [weatherData, setWeatherData] = useState<AllWeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [animationState, setAnimationState] = useState('visible');

    const locationsWithCoords = useMemo(() => farmLocations.filter(loc => loc.lat && loc.lon), [farmLocations]);

    useEffect(() => {
        if (locationsWithCoords.length === 0) {
            setIsLoading(false);
            return;
        }
        const location = locationsWithCoords[currentIndex];
        fetchMockWeatherData(location.lat, location.lon).then(data => {
            setWeatherData(data);
            setIsLoading(false);
            setAnimationState('visible');
        });
    }, [currentIndex, locationsWithCoords]);

    useEffect(() => {
        if (locationsWithCoords.length <= 1) return;

        const cycle = () => {
            setAnimationState('fading-out');
            setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % locationsWithCoords.length);
            }, 500); // Increased duration for smoother fade
        };

        const intervalId = setInterval(cycle, 7000);

        return () => clearInterval(intervalId);
    }, [locationsWithCoords.length]);

    const currentLoc = locationsWithCoords[currentIndex];
    const currentWeatherData = weatherData?.current;
    const agriculturalData = weatherData?.agricultural;

    const WeatherContent = () => {
        if (isLoading) return <div className="flex-grow flex items-center justify-center text-center text-gray-500">Loading weather...</div>;
        if (!currentLoc || !currentWeatherData || !agriculturalData) return <div className="flex-grow flex items-center justify-center text-center text-gray-500">No farm locations with geo-coordinates found in settings.</div>;
        
        return (
            <div className={`transition-opacity duration-500 ease-in-out ${animationState === 'visible' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Today's Weather</h3>
                        <p className="text-sm text-gray-500">{currentLoc.name}</p>
                    </div>
                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium border border-blue-200 capitalize">{currentWeatherData.weather[0].description}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6 mt-4">
                    {/* Left Part: Icon & Temp */}
                    <div className="flex items-center gap-4">
                        {getWeatherIcon(currentWeatherData.weather[0].icon, 'h-16 w-16 flex-shrink-0')}
                        <div className="flex items-baseline space-x-1">
                            <p className="text-5xl font-bold text-gray-800">{Math.round(currentWeatherData.temp)}</p>
                            <p className="text-2xl font-medium text-gray-500">&deg;C</p>
                        </div>
                    </div>
                    {/* Right Part: Details */}
                    <div className="w-full sm:w-auto sm:border-l border-gray-200 sm:pl-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center space-x-1.5"><ThermometerIcon className="h-4 w-4 text-gray-500" /><span>Feels like {Math.round(currentWeatherData.feels_like)}&deg;</span></div>
                        <div className="flex items-center space-x-1.5"><HumidityIcon className="h-4 w-4 text-gray-500" /><span>Humidity: {currentWeatherData.humidity.toFixed(0)}%</span></div>
                        <div className="flex items-center space-x-1.5"><UvIndexIcon className="h-4 w-4 text-gray-500" /><span>UV Index: {currentWeatherData.uvi.toFixed(1)}</span></div>
                        <div className="flex items-center space-x-1.5"><WindIcon className="h-4 w-4 text-gray-500" /><span>{currentWeatherData.wind_speed.toFixed(1)} km/h {getWindDirection(currentWeatherData.wind_deg)}</span></div>
                    </div>
                </div>

                <hr className="my-4 border-gray-200" />

                <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Agricultural Conditions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <DataWidget title="Soil Temp" value={agriculturalData.soil_temp.toFixed(1)} unit="°C" icon={<ThermometerIcon className="h-5 w-5"/>} />
                         <DataWidget title="Soil Moisture" value={agriculturalData.soil_moisture.toFixed(1)} unit="%" icon={<SoilMoistureIcon className="h-5 w-5"/>} />
                         <DataWidget title="GDD" value={agriculturalData.gdd.toFixed(1)} unit="" icon={<GddIcon className="h-5 w-5"/>} />
                         <DataWidget title="ET" value={agriculturalData.et.toFixed(1)} unit="mm/day" icon={<EvapotranspirationIcon className="h-5 w-5"/>} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between w-full h-full">
            <WeatherContent />
            <button
                onClick={onNavigate}
                className="bg-slate-800 text-white px-6 py-2 mt-6 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors w-full self-end flex items-center justify-center">
                View full forecast
                <ArrowRightIcon />
            </button>
        </div>
    );
};

const UserProfileCard = ({ userProfile, businessProfile, onNavigate }: { userProfile: UserProfile, businessProfile: BusinessProfile, onNavigate: () => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center w-full h-full justify-between">
        <div className="relative mb-3">
            <img src={userProfile.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
        </div>
        <div className="flex flex-col items-center">
            <h3 className="font-bold text-lg text-gray-800">{userProfile.name}</h3>
            <p className="text-sm font-medium text-gray-500">{userProfile.role}</p>
            <p className="text-sm text-gray-500 mt-3">{businessProfile.name}</p>
        </div>
        <button onClick={onNavigate} className="bg-[#2E7D32] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors w-full flex items-center justify-center">
            View Profile
            <ArrowRightIcon />
        </button>
    </div>
);

const Dashboard = ({ setSidebarOpen, setActivePage, userProfile, farmLocations, businessProfile, pendingDocuments, rejectedDocuments, currentUserPlan, healthEvents, currentUser }: { 
    setSidebarOpen: (isOpen: boolean) => void; 
    setActivePage: (page: string) => void; 
    userProfile: UserProfile; 
    farmLocations: FarmLocation[];
    businessProfile: BusinessProfile;
    pendingDocuments: FinancialDocument[];
    rejectedDocuments: RejectedFinancialDocument[];
    currentUserPlan: 'Starter' | 'Pro' | 'Premium';
    healthEvents: HealthEvent[];
    currentUser: TeamMember;
}) => {
    
    const livestockNotificationCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        return healthEvents.filter(event => new Date(event.date) > today).length;
    }, [healthEvents]);

    const accessibleToolItems = useMemo(() => {
        return TOOL_ITEMS.filter(item => currentUser.permissions.includes(item.name));
    }, [currentUser]);

    const handleToolClick = (toolName: string) => {
        if (['Farm Records', 'Cropping Planner', 'Livestock Planner', 'Store Management', 'Receipt Generator', 'User Profile', 'Talk to Farmr', 'Gov/NGO Support'].includes(toolName)) {
            setActivePage(toolName);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };
    
    return (
    <main className="flex-1 w-full p-4 md:p-8 bg-slate-100 overflow-y-auto">
      <header className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700">{getGreeting()}, {userProfile.name.split(' ')[0]}</h2>
        <div className="flex items-center space-x-2 md:space-x-4">
            {currentUserPlan !== 'Premium' && (
                <button 
                    onClick={() => alert('Upgrade to a higher plan to unlock more features!')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors shadow-md text-sm"
                >
                    <ArrowUpIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Upgrade Plan</span>
                </button>
            )}
            <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                aria-label="Open sidebar"
            >
                <MenuIcon />
            </button>
        </div>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <WeatherCard onNavigate={() => setActivePage('Weather')} farmLocations={farmLocations} />
          </div>
          <div className="md:col-span-1">
            <UserProfileCard userProfile={userProfile} businessProfile={businessProfile} onNavigate={() => handleToolClick('User Profile')} />
          </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-gray-700 mb-6">Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {accessibleToolItems.map((item: ToolItem) => {
            let notificationCount = 0;
            if (item.name === 'Store Management') {
                notificationCount = pendingDocuments.length;
            } else if (item.name === 'Receipt Generator') {
                notificationCount = rejectedDocuments.length;
            } else if (item.name === 'Livestock Planner') {
                notificationCount = livestockNotificationCount;
            }

            return (
                <React.Fragment key={item.name}>
                <ToolCard 
                    item={item} 
                    onClick={['Farm Records', 'Cropping Planner', 'Livestock Planner', 'Store Management', 'Receipt Generator', 'Talk to Farmr', 'Gov/NGO Support'].includes(item.name) ? () => handleToolClick(item.name) : undefined}
                    notificationCount={notificationCount}
                />
                </React.Fragment>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
