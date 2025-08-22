import { Metadata } from "next";

import AddPropertyForm from "@/ui/properties/add/add-property-form";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { requireSessionUser } from "@/utils/require-session-user";

export const metadata: Metadata = {
    title: "Add New Property"
}

const AddPropertyPage = async () => {
    const sessionUser = await requireSessionUser();
    console.log(`>>> ADD PROPERTY PAGE: ${sessionUser.email}`);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Properties", href: "/properties" },
                    { label: "Add Property", href: "/properties/add", active: true }
                ]}
            />
            <AddPropertyForm />
        </main>
    );
}
 
export default AddPropertyPage;