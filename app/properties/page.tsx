import { Metadata } from "next";

import properties from '@/properties.json';
import PropertiesList from "@/components/PropertiesList";

export const metadata: Metadata = {
    title: 'Properties'
}

const PropertiesPage = () => {
    return (
        <main>
            <PropertiesList properties={properties} />
        </main>
    );
}
 
export default PropertiesPage;