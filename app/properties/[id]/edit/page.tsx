import EditPropertyForm from "@/app/ui/properties/id/edit/edit-property-form";
import { fetchProperty } from "@/app/lib/data/property-data";
import { PropertyInterface } from "@/app/models";

const EditPropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const propertyDoc = (await fetchProperty(id) as PropertyInterface);
    const property: PropertyInterface = JSON.parse(JSON.stringify(propertyDoc));

    return (
        <section className="bg-blue-50">
            <div className="container m-auto max-w-2xl py-24">
                <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <EditPropertyForm property={property} />
                </div>

            </div>
        </section>
    );
}
 
export default EditPropertyPage;