import { Metadata } from "next";

import properties from '@/properties.json';
import PropertiesList from "@/components/PropertiesList";

export const metadata: Metadata = {
    title: 'Properties'
}

const PropertiesPage = async () => {
    // Artificial delay for testing loading components.
    console.log('Fetching data...')
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('Data received...')

    return (
        <main>
            <PropertiesList properties={properties} />
        </main>
    );
}
 
export default PropertiesPage;