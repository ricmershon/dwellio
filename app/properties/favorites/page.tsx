import { Metadata } from "next";

import { fetchFavoritedProperties } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";
import { getSessionUser } from "@/utils/get-session-user";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import PropertiesList from "@/ui/properties/properties-list";

export const metadata: Metadata = {
    title: "Favorite Properties"
}

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