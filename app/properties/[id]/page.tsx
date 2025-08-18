import { Metadata } from "next";

import { fetchProperty } from "@/lib/data/property-data";
import PropertyDetails from '@/ui/properties/id/details';
import PropertyImages from "@/ui/properties/id/images";
import PropertyPageAside from "@/ui/properties/id/aside";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { getSessionUser } from "@/utils/get-session-user";
import PropertyFavoriteButton from "@/ui/properties/shared/form/property-favorite-button";
import { toSerializedOjbect } from "@/utils/to-serialized-object";
import ShareButtons from "@/ui/properties/id/share-buttons";

export const metadata: Metadata = {
    title: 'Property'
}

// FIXME: Add label to favorite button
const PropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const sessionUser = await getSessionUser();

    const propertyDoc = await fetchProperty(id);
    const property = toSerializedOjbect(propertyDoc);

    const notPropertyOwner = sessionUser && sessionUser.id !== property.owner.toString();

    return (
        <main>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <Breadcrumbs
                    breadcrumbs={[
                        { label: 'Properties', href: '/properties' },
                        { label: `${property.type} in ${property.location.city}`, href: `/properties/${id}`, active: true }
                    ]}
                />
                <div className="mb-6">
                    <div className="flex justify-start items-center text-sm">
                        <ShareButtons property={property} />

                        {/* Display favorite button if not owned by user and logged in */}
                        {notPropertyOwner && (
                            <div className="flex justify-between items-center ml-4">
                                <div>
                                    <PropertyFavoriteButton
                                        propertyId={property._id}
                                    />
                                </div>
                                <p className="ml-1">Favorite</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Property images */}
            <PropertyImages imagesData={property.imagesData!} />

            {/* Property details */}
            <section className="mt-4">
                <div>
                    <div className={`grid grid-cols-1 w-full gap-[20px] ${notPropertyOwner && 'md:grid-cols-70/30'}`}>
                    {/* <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-[14px]"> */}
                        <PropertyDetails property={property} />
                        {notPropertyOwner && (
                            <PropertyPageAside property={property} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
 
export default PropertyPage;