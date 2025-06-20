import Image from "next/image";
import Link from "next/link";

import { PropertyInterfaceWithId } from "@/app/lib/definitions";
import DeletePropertyForm from "./DeletePropertyForm";

const ProfileProperties = (
    { properties }: { properties: Array<PropertyInterfaceWithId> }
) => {
    return (
        <>
            {properties.length !== 0 && properties.map((property) => {
                const { street, city, state } = property.location;
                const propertyId = property._id.toString();
                return (
                    <div key={propertyId} className="mb-10">
                        <Link href={`/properties/${propertyId}`}>
                            <Image
                                className="h-32 w-full rounded-md object-cover"
                                src={property.images[0]}
                                alt="Property 1"
                                width={400}
                                height={400}
                            />
                        </Link>
                        <div className="mt-2">
                            <p className="text-lg font-semibold">{property.name}</p>
                            <p className="text-gray-600">Address: {street} {city} {state}</p>
                        </div>
                        <div className="mt-2">
                            <Link
                                href={`/properties/${propertyId}/edit`}
                                className="bg-blue-500 text-white px-3 py-3 rounded-md mr-2 hover:bg-blue-600"
                            >
                                Edit
                            </Link>
                            <DeletePropertyForm propertyId={propertyId} />
                        </div>
                    </div>
                )
            })}
        </>
    );
}
 
export default ProfileProperties;