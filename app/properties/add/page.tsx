import { Metadata } from "next";

import AddPropertyForm from "@/ui/properties/add/add-property-form";
import Breadcrumbs from "@/ui/shared/breadcrumbs";

export const metadata: Metadata = {
    title: "Add New Property"
}

const AddPropertyPage = () => {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Properties', href: '/properties' },
                    { label: 'Add Property', href: '/properties/add', active: true }
                ]}
            />
            <AddPropertyForm />
        </main>
    );
}
 
export default AddPropertyPage;