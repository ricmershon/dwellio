'use client';

import { Gallery } from 'react-photoswipe-gallery';

import { PropertyImageData } from "@/types/types";
import PropertyImagesGallery from "@/ui/properties/id/images-gallery";

const PropertyImages = ({ imagesData }: { imagesData: PropertyImageData[] }) => (
    <section>
        <Gallery>
            <PropertyImagesGallery imagesData={imagesData} />
        </Gallery>
    </section>
);

export default PropertyImages;