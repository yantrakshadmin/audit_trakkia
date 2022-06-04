import { useState, useEffect } from "react";

const useGeoLocation = () => {
    const [location, setLocation] = useState({
        // loaded: false,
        coordinates: { lat: "", lng: "" },
    });

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
        let tempLocation;
     
        let error;
        if (!("geolocation" in navigator)) {
            error ={
                code: 0,
                message: "Geolocation not supported",
            } ;
        }

        navigator.geolocation.getCurrentPosition((location) => {
           tempLocation = { 
                lat: location.coords.latitude,
                    lng: location.coords.longitude,
           }
          
        }, (error) => {
            error = {
                code: error.code,
                message: error.message,
            }
        }
         
        );
        return { location:tempLocation , error }
    }

   return { getLocation}
        
};

export default useGeoLocation;