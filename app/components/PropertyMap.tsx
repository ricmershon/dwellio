'use client';

import { useEffect, useState } from "react";
import { setDefaults, fromAddress, OutputFormat } from "react-geocode";

import { PropertyInterface } from "@/app/lib/definitions";

// TODO: Use google maps
const PropertyMap = ({ property }: { property: PropertyInterface}) => {
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [viewport, setViewport] = useState({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        width: '100%',
        height: '500px'
    });
    const [loading, setLoading] = useState(true);
    const [geocodeError, setGeocodeError] = useState(false);

    setDefaults({
        key: process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY,
        language: 'en',
        region: 'us',
        outputFormat: OutputFormat.JSON
    });

    const { street, city, state, zipcode } = property.location;

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                const response = await fromAddress(`${street} ${city} ${state} ${zipcode}`);

                if (response.results.length === 0) {
                    setGeocodeError(true);
                    return;
                }

                const { lat, lng } = response.results[0].geometry.location;
                setLatitude(lat);
                setLongitude(lng);
                setViewport({
                    ...viewport,
                    latitude: latitude!,
                    longitude: longitude!
                })
            } catch (error) {
                setGeocodeError(true);
                console.log('Error fetching coordinates.', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCoordinates();
    }, [city, state, street, viewport, zipcode, latitude, longitude, ]);

    return (
        <div>Property Map</div>
    );
}
 
export default PropertyMap;