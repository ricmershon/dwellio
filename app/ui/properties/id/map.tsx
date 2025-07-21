'use client';

import { useEffect, useState } from "react";
import { setDefaults, fromAddress, OutputFormat } from "react-geocode";
import Map, { Marker } from "react-map-gl/mapbox";
import Image from 'next/image';
import 'mapbox-gl/dist/mapbox-gl.css';

import { PropertyDocument } from "@/app/models";
import Spinner from "@/app/ui/shared/spinner";
import pin from '@/assets/images/pin.svg';

// TODO: Use google maps?
const PropertyMap = ({ property }: { property: PropertyDocument}) => {
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [viewport, setViewport] = useState({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        width: '100%',
        height: '500px'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [geocodeError, setGeocodeError] = useState(false);

    console.log('^^^^^^^^ MAPS ^^^^^^^^\nCalling setDefaults');
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
                console.log('^^^^^^^^ MAPS ^^^^^^^^\nCalling fromAddress');
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
                console.error(`Error fetching coordinates: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCoordinates();
    }, [city, state, street, viewport, zipcode, latitude, longitude, ]);

    if (geocodeError) {
        return (
            <div className="text xl">No location data found.</div>
        )
    }

    return (
        <>
            {!isLoading ? (
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    mapLib={import('mapbox-gl')}
                    initialViewState={{
                        longitude: longitude,
                        latitude: latitude,
                        zoom: 15
                    }}
                    style={{ width: '100%', height: 500 }}
                    mapStyle='mapbox://styles/mapbox/streets-v9'
                >
                    <Marker longitude={longitude!} latitude={latitude!} anchor="bottom">
                        <Image src={pin} alt='location' width={40} height={40} />
                    </Marker>
                </Map>
            ) : (
                <Spinner />
            )}
        </>
    );
}
 
export default PropertyMap;