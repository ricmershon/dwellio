import { fetchPaginatedProperties } from "@/app/lib/data/property-data";
import { PropertyDocument } from "@/app/models";
import PropertyCard from "@/app/ui/properties/property-card";

type PropertiesListProps =
    | { recentProperties: PropertyDocument[]; currentPage?: never }
    | { currentPage: number; recentProperties?: never };

const PropertiesList = async ({ currentPage, recentProperties }: PropertiesListProps) => {
const properties: PropertyDocument[] =
    recentProperties ?? (currentPage ? await fetchPaginatedProperties(currentPage) : []);

    return (
        <section>
            <div className='container-xl lg:container m-auto'>
                {properties.length !== 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {properties.map((property) => (
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