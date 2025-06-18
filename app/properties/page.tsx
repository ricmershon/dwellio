import { Metadata } from "next";

import { PropertyInterface } from "@/app/models/Property";
import PropertiesList from "@/app/components/PropertiesList";
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