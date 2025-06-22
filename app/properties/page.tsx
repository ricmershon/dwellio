import { Metadata } from "next";

import { PropertyInterfaceWithId } from "@/app/models";
import PropertiesList from "@/app/components/PropertiesList";
import { fetchProperties } from "@/app/lib/data";

export const metadata: Metadata = {
    title: 'Properties'
}

const PropertiesPage = async () => {
    const properties: Array<PropertyInterfaceWithId> = await fetchProperties(false);
    
    return (
        <main>
            <PropertiesList properties={properties} />
        </main>
    );
}
 
export default PropertiesPage;