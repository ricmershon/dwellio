import { Suspense } from "react";
import { Metadata } from "next";

import PropertiesList from "@/ui/properties/properties-list";
import PropertiesPagination from "@/ui/properties/properties-pagination";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { fetchNumPropertiesPages } from "@/lib/data/property-data";
import PropertiesListSkeleton from "@/ui/skeletons/properties-list-skeleton";
import DelayedRender from "@/ui/shared/delayed-render";
import { PropertiesQuery } from "@/types";
import PropertiesFilterForm from "@/ui/properties/properties-filter-form";
import { getViewportWidth } from "@/utils/get-viewport-width";

export const metadata: Metadata = {
    title: "Properties"
}

interface PropertiesPageProps {
    searchParams: Promise<{
        query?: string
        page?: string
    }>
}

const PropertiesPage = async (props: PropertiesPageProps) => {
    const viewportWidth = await getViewportWidth();

    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const queryRegex = new RegExp(query, "i");
    
    const propertiesQuery: PropertiesQuery = {
        $or: [
            { name: queryRegex },
            { description: queryRegex },
            { amenities: queryRegex },
            { type: queryRegex },
            { "location.street": queryRegex },
            { "location.city": queryRegex },
            { "location.state": queryRegex },
            { "location.zip": queryRegex },
        ],
    };

    const totalPages = await fetchNumPropertiesPages(propertiesQuery, viewportWidth);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Properties", href: "/properties", active: true }
                ]}
            />
            <PropertiesFilterForm />
            <Suspense fallback={
                <DelayedRender>
                    <PropertiesListSkeleton />
                </DelayedRender>
            }>
                <PropertiesList
                    query={propertiesQuery}
                    currentPage={currentPage}
                    viewportWidth={viewportWidth}
                />
            </Suspense>
            {totalPages > 0 &&
                <div className="mt-5 flex w-full justify-center">
                    <PropertiesPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            }
        </main>
    );
}
 
export default PropertiesPage;