import { Metadata } from "next";

import EditPropertyForm from "@/ui/properties/id/edit/edit-property-form";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { fetchProperty } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";
import { requireSessionUser } from "@/utils/require-session-user";

export const metadata: Metadata = {
    title: "Edit Property"
}

const EditPropertyPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const sessionUser = await requireSessionUser();
    console.log(`>>> EDIT PROPERTY PAGE: ${sessionUser.email}`);
    const { id } = await params;

    const propertyDoc = (await fetchProperty(id) as PropertyDocument);
    const property: PropertyDocument = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Profile", href: "/profile" },
                    { label: "Edit Property", href: `/properties/${property._id}/edit`, active: true }
                ]}
            />
            <EditPropertyForm property={property} />
        </main>
    );
}
 
export default EditPropertyPage;