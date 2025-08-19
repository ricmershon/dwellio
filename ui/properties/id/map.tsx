'use client';

import { useEffect, useState } from "react";
import { setDefaults, fromAddress, OutputFormat } from "react-geocode";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import Image from 'next/image';
import 'mapbox-gl/dist/mapbox-gl.css';

import { PropertyDocument } from "@/models";
import pin from '@/assets/images/pin.svg';
import MapSkeleton from "@/ui/skeletons/map-skeleton";

interface PropertyMapProps {
    property: PropertyDocument,
    viewportWidth: number
}
const PropertyMap = ({ property, viewportWidth }: PropertyMapProps) => {
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);

    /**
     * Set the height of the map based on the screen's viewport width.
     */
    let height: number;
    if (viewportWidth < 640) {
        height = 400;
    } else if (viewportWidth < 768) {
        height = 500;
    } else {
        height = 800;
    }

    const [viewport, setViewport] = useState({
        latitude: 0,
        longitude: 0,
        zoom: 12,
        width: '100%',
        height: `${height.toString()}px`
    });
    const [isLoading, setIsLoading] = useState(true);
    const [hasGeocodeError, setHasGeocodeError] = useState(false);

    const { street, city, state, zipcode } = property.location;

    const locationInfo = (
        <p className="mb-2 text-gray-800">
            {street} {city}, {state} {zipcode}
        </p>
    );

    setDefaults({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: 'en',
        region: 'us',
        outputFormat: OutputFormat.JSON
    });

    useEffect(() => {
        fromAddress(`${street} ${city} ${state} ${zipcode}`).then((response) => {
            if (response.results.length === 0) {
                setHasGeocodeError(true);
                return;
            }

            const { lat, lng } = response.results[0].geometry.location;

            setLatitude(lat);
            setLongitude(lng);

            setViewport({
                ...viewport,
                latitude: latitude!,
                longitude: longitude!
            });
        })
        .catch((error) => {
            setHasGeocodeError(true);
            console.error(`Error fetching coordinates: ${error}`);
        })
        .finally(() => {
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (hasGeocodeError) {
        return (
            <>
                {locationInfo}
                <div className="text-sm">No location data found.</div>
            </>
        )
    }

    return (
        <>
            {locationInfo}
            {!isLoading ? (
                <>
                    <Map
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        mapLib={import('mapbox-gl')}
                        initialViewState={{
                            longitude: longitude,
                            latitude: latitude,
                            zoom: 15
                        }}
                        style={{ width: '100%', height: height }}
                        mapStyle='mapbox://styles/mapbox/streets-v9'
                    >
                        <Marker longitude={longitude!} latitude={latitude!} anchor="bottom">
                            <Image src={pin} alt='location' width={40} height={40} />
                        </Marker>
                        <NavigationControl
                            showCompass={false}
                            position="top-right"
                        />
                    </Map>
                </>
            ) : (
                <MapSkeleton
                    height={height}
                />
            )}
        </>
    );
}
 
export default PropertyMap;