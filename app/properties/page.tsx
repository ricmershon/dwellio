import { Suspense } from "react";
import { Metadata } from "next";

import PropertiesList from "@/app/ui/properties/properties-list";
import PropertiesPagination from "@/app/ui/properties/properties-pagination";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";
import { fetchNumPropertiesPages } from "@/app/lib/data/property-data";
import PropertiesListSkeleton from "@/app/ui/skeletons/properties-list-skeleton";
import DelayedRender from "@/app/ui/shared/delayed-render";

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

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Properties', href: '/properties', active: true }
                ]}
            />
            <Suspense fallback={
                <DelayedRender>
                    <PropertiesListSkeleton />
                </DelayedRender>
            }>
                <PropertiesList currentPage={currentPage} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <PropertiesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            </div>
        </main>
    );
}
 
export default PropertiesPage;