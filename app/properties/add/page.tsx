import AddPropertyForm from "@/app/ui/properties/add/form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Property"
}

const AddPropertyPage = () => {
    return (
        <main>
            <section className="bg-blue-50">
                <div className="container m-auto max-w-2xl py-24">
                    <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                        <AddPropertyForm />
                    </div>
                </div>
            </section>
        </main>
    );
}
 
export default AddPropertyPage;