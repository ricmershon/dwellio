import EditPropertyForm from "@/app/components/EditPropertyForm";
import { fetchPropertyById } from "@/app/lib/data";
import { PropertyInterface } from "@/app/models";

const EditPropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // TODO: use better procedure for serializing objects
    const property = (await fetchPropertyById(id) as PropertyInterface);
    const plainProperty: PropertyInterface = JSON.parse(JSON.stringify(property));

    // Serialize?

    return (
        <section className="bg-blue-50">
            <div className="container m-auto max-w-2xl py-24">
                <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <EditPropertyForm property={plainProperty} />
                </div>

            </div>
        </section>
    );
}
 
export default EditPropertyPage;