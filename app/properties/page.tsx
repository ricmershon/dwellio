import { Metadata } from "next";

import { PropertyInterface } from "@/models/Property";
import PropertiesList from "@/components/PropertiesList";
import { fetchProperties } from "@/lib/data";

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