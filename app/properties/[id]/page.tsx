import { fetchProperty } from "@/app/lib/data/property-data";
import PropertyDetails from '@/app/ui/properties/id/details';
import PropertyImages from "@/app/ui/properties/id/images";
import PropertyPageAside from "@/app/ui/properties/id/aside";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";
import { getSessionUser } from "@/app/utils/get-session-user";
import PropertyFavoriteButton from "@/app/ui/properties/shared/property-favorite-button";
import { toSerializedOjbect } from "@/app/utils/to-serialized-object";
import ShareButtons from "@/app/ui/properties/id/share-buttons";

const PropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const sessionUser = await getSessionUser();

    const propertyDoc = await fetchProperty(id);
    const property = toSerializedOjbect(propertyDoc);

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
                        {sessionUser && sessionUser.id !== property.owner.toString() && (
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
                <div className="container m-auto">
                    <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-[14px]">
                        <PropertyDetails property={property} />
                        <PropertyPageAside property={property} />
                    </div>
                </div>
            </section>
        </main>
    );
}
 
export default PropertyPage;