'use client';

import Image from "next/image";
import { Gallery, Item } from 'react-photoswipe-gallery';

import { PropertyImageData } from "@/app/types/types";

const PropertyImages = ({ imagesData }: { imagesData: PropertyImageData[] }) => {
    return (
        <Gallery>
            <section className="">
                {imagesData.length === 1 ? (
                    <Item
                        original={imagesData[0].secureUrl}
                        thumbnail={imagesData[0].secureUrl}
                        width="1000"
                        height="600"
                    >
                        {({ ref, open }) => (
                            <Image
                                ref={ref}
                                onClick={open}
                                src={imagesData[0].secureUrl}
                                alt=""
                                className='object-cover h-[400px] mx-auto rounded-md cursor-pointer'
                                width={1800}
                                height={400}
                                priority={true}
                            />
                        )}
                    </Item>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {imagesData.map((imageData, index) => (
                            <div
                                key={imageData.secureUrl}
                                className={
                                    `${imagesData.length === 3 && index === 2
                                        ? 'col-span-2'
                                        : 'col-span-1'}`
                                }
                            >
                                <Item
                                    original={imageData.secureUrl}
                                    thumbnail={imageData.secureUrl}
                                    width="1000"
                                    height="600"
                                >
                                    {({ ref, open }) => (
                                        <Image
                                            ref={ref}
                                            onClick={open}
                                            src={imageData.secureUrl}
                                            alt=""
                                            className='object-cover h-[400px] w-full rounded-md cursor-pointer'
                                            width={1800}
                                            height={400}
                                            priority={true}
                                        />
                                    )}
                                </Item>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Gallery>
    );
}
 
export default PropertyImages;