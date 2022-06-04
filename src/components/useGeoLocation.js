import { useState, useEffect } from "react";

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);

    const onSuccess = (location) => {
        setLocation({
            // loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
        });
    };

    const onError = (error) => {
    
        setLocation({
            // loaded: true,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    };

    const getLocation = () => {     
        if (!("geolocation" in navigator)) {
            onError({error: {
                code: 0,
                message: "Geolocation not supported",
            }})
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

   return { getLocation, location}
        
};

export default useGeoLocation;