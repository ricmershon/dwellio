import { Metadata } from "next";

import PropertiesList from "@/app/ui/properties/properties-list";
import PropertiesPagination from "@/app/ui/properties/properties-pagination";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";
import { fetchNumPropertiesPages, fetchPaginatedProperties } from "@/app/lib/data/property-data";
import { toSerializedOjbect } from "@/app/utils/to-serialized-object";
import { PropertyDocument } from "@/app/models";

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
    const serializedProperties: PropertyDocument[] = toSerializedOjbect(
        await fetchPaginatedProperties(currentPage)
    );

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Recent Properties', href: '/properties', active: true }
                ]}
            />
            <PropertiesList properties={serializedProperties} />
            <PropertiesPagination
                page={currentPage}
                totalPages={totalPages}
            />
        </main>
    );
}
 
export default PropertiesPage;