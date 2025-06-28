import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import { fetchPropertyById } from "@/app/lib/data";
import PropertyHeaderImage from "@/app/ui/properties/id/header-image";
import PropertyDetails from '@/app/ui/properties/id/details';
import PropertyImages from "@/app/ui/properties/id/images";
import BookmarkPropertyButton from "@/app/ui/properties/id/bookmark-button";
import ShareButtons from "@/app/ui/properties/id/share-buttons";
import PropertyContactForm from "@/app/ui/properties/id/contact-form";
import { PropertyInterface } from "@/app/models";

const PropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const propertyDoc = await fetchPropertyById(id);
    const property: PropertyInterface = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <main>
            <PropertyHeaderImage image={property!.images[0]} />

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
                        <PropertyDetails property={property!}/>
                        <aside className="space-y-4">
                            <BookmarkPropertyButton propertyId={id} />
                            <ShareButtons property={property} />
                            <PropertyContactForm property={property} />
                        </aside>
                    </div>
                </div>
            </section>

            {/* Property images */}
            <PropertyImages images={property!.images} />
        </main>
    );
}
 
export default PropertyPage;