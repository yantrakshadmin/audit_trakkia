import { useState, useEffect } from "react";

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);

    const onSuccess = (location) => {
        setLocation({
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

    const getLocation = async () => {  
        let temLocation;
        if (!("geolocation" in navigator)) {
            onError({error: {
                code: 0,
                message: "Geolocation not supported",
            }})
        }

        await navigator.geolocation.getCurrentPosition((l) => {
            onSuccess(l)
            console.log(l, "llllllllllllll");
            temLocation = l;
          
        }, onError);
        console.log(temLocation,"tempppppppppppp");
    }

   return { getLocation, location}
        
};

export default useGeoLocation;