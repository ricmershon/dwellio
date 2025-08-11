import { fetchFeaturedProperties, fetchPaginatedProperties } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";
import { PropertiesQuery } from "@/types/types";
import PropertyCard from "@/ui/properties/property-card";

type PropertiesListProps =
    | { properties: PropertyDocument[]; viewportWidth: number; currentPage?: never; query?: never; featured?: never }
    | { currentPage: number; query: PropertiesQuery; viewportWidth: number; properties?: never; featured?: never }
    | { query: PropertiesQuery; currentPage: number; viewportWidth: number; properties?: never; featured?: never }
    | { featured: boolean; viewportWidth: number; properties?: never; currentPage?: never; query?: never };

const PropertiesList = async ({ featured = false, currentPage, properties, query, viewportWidth }: PropertiesListProps) => {
    let propertiesToList: PropertyDocument[];

    if (featured) {
        propertiesToList = await fetchFeaturedProperties(viewportWidth);
    } else {
        propertiesToList = properties
            ?? (currentPage ? await fetchPaginatedProperties(currentPage, viewportWidth, query) : []);

    }

    return (
        <section>
            <div className='container-xl lg:container m-auto'>
                {propertiesToList.length !== 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {propertiesToList.map((property) => (
                            <PropertyCard
                                key={(property._id as string).toString()}
                                property={property}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No properties found</p>
                )}
            </div>
        </section>
    );
 };

export default PropertiesList;