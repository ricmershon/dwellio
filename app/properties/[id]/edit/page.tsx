import { Metadata } from "next";

import EditPropertyForm from "@/ui/properties/id/edit/edit-property-form";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { fetchProperty } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";

export const metadata: Metadata = {
    title: "Edit Property"
}

const EditPropertyPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const propertyDoc = (await fetchProperty(id) as PropertyDocument);
    const property: PropertyDocument = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Edit Property', href: `/properties/${property._id}/edit`, active: true }
                ]}
            />
            <EditPropertyForm property={property} />
        </main>
    );
}
 
export default EditPropertyPage;