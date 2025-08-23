import Image from "next/image";
import Link from "next/link";

import { PropertyDocument } from "@/models";
import DeletePropertyButton from "@/ui/profile/delete-property-button";

const ProfileProperties = (
    { properties }: { properties: PropertyDocument[] }
) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {properties.length !== 0 && properties.map((property) => {
            const { street, city, state } = property.location;
            const propertyId = (property._id as string).toString();
            return (
                <div key={propertyId} className="mb-4 md:mb-6 rounded-lg shadow-lg">
                    <Link href={`/properties/${propertyId}`}>
                        <Image
                            className="h-32 w-full rounded-t-lg object-cover"
                            src={property.imagesData![0].secureUrl}
                            alt={propertyId}
                            width={400}
                            height={400}
                        />
                    </Link>
                    <div className="p-4">
                        <div className="">
                            <p className="text-lg">{property.name}</p>
                            <p className="text-gray-800">{street} {city} {state}</p>
                        </div>
                        <div className="mt-2 flex">
                            <Link
                                href={`/properties/${propertyId}/edit`}
                                className="btn btn-primary mr-2"
                            >
                                Edit
                            </Link>
                            <DeletePropertyButton propertyId={propertyId} />
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
);
 
export default ProfileProperties;