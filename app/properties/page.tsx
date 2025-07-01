import { Metadata } from "next";

import PropertiesList from "@/app/ui/properties/properties-list";
import PropertiesPagination from "../ui/properties/properties-pagination";
import { fetchNumPropertiesPages, fetchPaginatedProperties } from "../lib/data/property-data";

export const metadata: Metadata = {
    title: 'Properties'
}

interface PropertiesPageProps {
    searchParams: Promise<{
        page?: string
    }>
}

const PropertiesPage = async (props: PropertiesPageProps) => {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    
    const totalPages = await fetchNumPropertiesPages();
    const properties = await fetchPaginatedProperties(currentPage);

    return (
        <main>
            <PropertiesList properties={properties} />
            <PropertiesPagination
                page={currentPage}
                totalPages={totalPages}
            />
        </main>
    );
}
 
export default PropertiesPage;