import { fetchFavoritedProperties } from "@/app/lib/data/property-data";
import { PropertyDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";
import PropertiesList from "@/app/ui/properties/properties-list";

const FavoritePropertiesPage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const savedProperties: PropertyDocument[] = await fetchFavoritedProperties(sessionUser.id);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Favorite Properties', href: '/properties/favorites', active: true }
                ]}
            />
            <PropertiesList properties={savedProperties} />
        </main>
    );
}
 
export default FavoritePropertiesPage;