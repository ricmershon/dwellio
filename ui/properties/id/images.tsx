"use client";

import dynamic from "next/dynamic";
const Gallery = dynamic(() => import("react-photoswipe-gallery").then(m => m.Gallery), { ssr: false });

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