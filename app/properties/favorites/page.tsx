import PropertyCard from "@/app/ui/properties/property-card";
import { fetchFavoritedProperties } from "@/app/lib/data/property-data";
import { PropertyDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";

const SavedPropertiesPage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const savedProperties: PropertyDocument[] = await fetchFavoritedProperties(sessionUser.id);

    return (
        <main>
            <section className="px-4 py-6">
                <div className="container lg:container m-auto px-4 py-6">
                    <h1 className="text-2xl mb-4">Favorite Properties</h1>
                    {savedProperties.length === 0 ? (
                        <p>No favorite properties</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {savedProperties.map((property) => (
                                <PropertyCard
                                    key={property.name}
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
 
export default SavedPropertiesPage;