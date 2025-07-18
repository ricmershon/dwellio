import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import { fetchProperty } from "@/app/lib/data/property-data";
import PropertyHeaderImage from "@/app/ui/properties/id/header-image";
import PropertyDetails from '@/app/ui/properties/id/details';
import PropertyImages from "@/app/ui/properties/id/images";
import PropertyPageAside from "@/app/ui/properties/id/aside";
import { PropertyDocument } from "@/app/models";

const PropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const propertyDoc = await fetchProperty(id);
    const property: PropertyDocument = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <main>
            <PropertyHeaderImage image={property.imagesData![0].secureUrl} />

            {/* Link to return to properties page */}
            <section>
                <div className="container m-auto py-6 px-6">
                    <Link
                        href="/properties"
                        className="text-blue-500 hover:text-blue-600 flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Properties
                    </Link>
                </div>
            </section>

            {/* Property details */}
            <section className="bg-blue-50">
                <div className="container m-auto py-10 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
                        <PropertyDetails property={property} />
                        <PropertyPageAside property={property} propertyId={id} />
                    </div>
                </div>
            </section>

            {/* Property images */}
            <PropertyImages imagesData={property.imagesData!} />
        </main>
    );
}
 
export default PropertyPage;