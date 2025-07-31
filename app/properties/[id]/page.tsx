import { fetchProperty } from "@/app/lib/data/property-data";
import PropertyDetails from '@/app/ui/properties/id/details';
import PropertyImages from "@/app/ui/properties/id/images";
import PropertyPageAside from "@/app/ui/properties/id/aside";
import { PropertyDocument } from "@/app/models";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";

const PropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const propertyDoc = await fetchProperty(id);
    
    const property: PropertyDocument = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Properties', href: '/properties' },
                    { label: `${property.type} in ${property.location.city}`, href: `/properties/${id}`, active: true }
                ]}
            />

            {/* Property images */}
            <PropertyImages imagesData={property.imagesData!} />

            {/* Property details */}
            <section className="bg-blue-50">
                <div className="container m-auto py-10 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
                        <PropertyDetails property={property} />
                        <PropertyPageAside property={property} propertyId={id} />
                    </div>
                </div>
            </section>

        </main>
    );
}
 
export default PropertyPage;