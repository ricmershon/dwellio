import { Metadata } from "next";
import { Types } from "mongoose";

import PropertyCard from "@/ui/properties/property-card";
import PropertySearchForm from "@/ui/properties/search/search-form";
import { PropertiesQuery } from "@/types/types";
import { searchProperties } from "@/lib/data/property-data";
import Breadcrumbs from "@/ui/shared/breadcrumbs";

export const metadata: Metadata = {
    title: "Search Properties"
}

interface SearchResultsPageProps {
    searchParams: Promise<{
        query: string;
        propertyType: string
    }>
}

const SearchResultsPage = async (props: SearchResultsPageProps) => {
    const searchParams = await props.searchParams;
    const { query, propertyType } = searchParams;
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
    }
    
    /**
     * If the property type is not `All`, add the `type` key and the regex for
     * `properType` to the query object.
     */
    if (propertyType && propertyType !== "All") {
        const propertyTypeRegex = new RegExp(propertyType, "i");
        Object.assign(propertiesQuery, { type: propertyTypeRegex });
    }

    const propertiesQueryResults = await searchProperties(propertiesQuery);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Properties", href: "/properties" },
                    { label: "Search Properties", href: "/properties/search", active: true }
                ]}
            />
            <div className="mx-auto flex flex-col">
                <PropertySearchForm />
            </div>

            <section className="py-6">
                <div className="m-auto">
                    <h1 className="heading">Search Results</h1>
                    {propertiesQueryResults.length === 0 ? (
                        <p>No search results</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {propertiesQueryResults.map((property) => (
                                <PropertyCard
                                    key={(property._id as Types.ObjectId).toString()}
                                    property={property}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
 
export default SearchResultsPage;