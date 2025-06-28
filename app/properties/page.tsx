import { Metadata } from "next";

import { PropertyInterface } from "@/app/models";
import PropertiesList from "@/app/ui/properties/properties-list";
import { fetchProperties } from "@/app/lib/data";

export const metadata: Metadata = {
    title: 'Properties'
}

const PropertiesPage = async () => {
    const properties: Array<PropertyInterface> = await fetchProperties(false);
    
    return (
        <main>
            <PropertiesList properties={properties} />
        </main>
    );
}
 
export default PropertiesPage;