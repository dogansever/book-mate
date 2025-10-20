import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface UseLocationResult {
  location: LocationData | null;
  error: LocationError | null;
  isLoading: boolean;
  requestLocation: () => void;
  clearLocation: () => void;
  isSupported: boolean;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported = 'geolocation' in navigator;

  // Şehir adını koordinatlara göre tahmin et (basit reverse geocoding)
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    // Türkiye'deki başlıca şehirlere yakınlık kontrolü
    const cities = [
      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
      { name: 'Adana', lat: 37.0000, lng: 35.3213 },
      { name: 'Konya', lat: 37.8713, lng: 32.4846 },
      { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
      { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
      { name: 'Kayseri', lat: 38.7312, lng: 35.4787 }
    ];

    let closestCity = 'İstanbul';
    let minDistance = Infinity;

    cities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city.name;
      }
    });

    return closestCity;
  };

  const requestLocation = () => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'Geolocation bu tarayıcıda desteklenmiyor.'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 dakika cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const city = await getCityFromCoordinates(latitude, longitude);
          
          setLocation({
            latitude,
            longitude,
            accuracy,
            city,
            country: 'Türkiye'
          });
          
          // localStorage'a kaydet
          localStorage.setItem('userLocation', JSON.stringify({
            latitude,
            longitude,
            city,
            timestamp: Date.now()
          }));
          
        } catch {
          setLocation({
            latitude,
            longitude,
            accuracy
          });
        }
        
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = 'Konum alınırken hata oluştu.';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Konum erişimi reddedildi. Lütfen tarayıcı ayarlarınızdan konum erişimini aktifleştirin.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi mevcut değil.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Konum alınırken zaman aşımına uğradı.';
            break;
        }
        
        setError({
          code: err.code,
          message: errorMessage
        });
        setIsLoading(false);
      },
      options
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    localStorage.removeItem('userLocation');
  };

  // Sayfa yüklendiğinde cached location'ı kontrol et
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const isStale = Date.now() - parsed.timestamp > 3600000; // 1 saat
        
        if (!isStale) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            city: parsed.city,
            country: 'Türkiye'
          });
        }
      } catch {
        // Geçersiz cache, temizle
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  return {
    location,
    error,
    isLoading,
    requestLocation,
    clearLocation,
    isSupported
  };
};

// Mesafe hesaplama utility fonksiyonu
export const calculateDistance = (
  coords1: { latitude: number; longitude: number },
  coords2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.latitude)) * 
    Math.cos(toRadians(coords2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export default useLocation;