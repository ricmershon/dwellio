import EditPropertyForm from "@/app/components/EditPropertyForm";
import { fetchPropertyById } from "@/app/lib/data";

const EditPropertyPage = async ( { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const property = await fetchPropertyById(id);
    console.log(property);

    return (
        <section className="bg-blue-50">
            <div className="container m-auto max-w-2xl py-24">
                <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <EditPropertyForm />
                </div>

            </div>
        </section>
    );
}
 
export default EditPropertyPage;