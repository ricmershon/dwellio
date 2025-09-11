import { MouseEventHandler } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import clsx from "clsx";
const Item = dynamic(() => import("react-photoswipe-gallery").then(m => m.Item), { ssr: false });
import { useGallery } from "react-photoswipe-gallery";
import { RiGalleryView2 } from "react-icons/ri";

import { PropertyImageData } from "@/types";

const PropertyImagesGallery = ({ imagesData }: { imagesData: PropertyImageData[] }) => {
    const { open } = useGallery();

    const handlePhotoIconClick: MouseEventHandler<SVGSVGElement> = (event) => {
        event.preventDefault();
        open(5);
    }

    const numImages = imagesData.length;

    return (
        <div className="relative">
            <div className={clsx(
                "grid grid-rows-2 gap-2 md:gap-3",
                {
                    "grid-cols-3": numImages === 3,
                    "grid-cols-2": numImages === 4,
                    "grid-cols-4": numImages === 5
                }
            )}>
                {imagesData.map((imageData, index) => (
                    <div
                        key={imageData.secureUrl}
                        className={clsx(
                            "object-cover h-full w-full rounded-md cursor-pointer aspect-square",
                            {
                                "col-span-2 row-span-2": (index === 0 && numImages > 4) || (index === 0 && numImages === 3),
                                "col-start-3": (index === 1 && numImages > 4) || (index === 1 && numImages === 3),
                                "col-start-4 row-start-1": index === 2 && numImages > 4,
                                "col-start-3 row-start-2": (index === 3 && numImages > 4) || (index === 2 && numImages === 3),
                                "col-start-4 row-start-2": index === 4 && numImages > 4,
                                "hidden": numImages > 4 && index > 4
                            }
                        )}
                    >
                        <Item
                            original={imageData.secureUrl}
                            thumbnail={imageData.secureUrl}
                            height={imageData.height}
                            width={imageData.width}
                        >
                            {({ ref, open: openItem }) => (
                                <div className="relative h-full w-full">
                                    <Image
                                        ref={ref}
                                        onClick={openItem}
                                        src={imageData.secureUrl}
                                        alt=""
                                        fill
                                        className="object-cover rounded-md cursor-pointer"
                                        priority={index === 0}
                                    />
                                    {index === 4 && imagesData.length > 5 &&
                                        <RiGalleryView2
                                            className="absolute bottom-2 right-2 size-10 z-10 text-gray-400 bg-white/80 rounded-sm"
                                            onClick={handlePhotoIconClick}
                                        />
                                    }
                                </div>
                            )}
                        </Item>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyImagesGallery;