import { Metadata } from "next";

import { fetchFavoritedProperties } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import PropertiesList from "@/ui/properties/properties-list";
import { requireSessionUser } from "@/utils/require-session-user";

export const metadata: Metadata = {
    title: "Favorite Properties"
}

const FavoritePropertiesPage = async () => {
    const sessionUser = await requireSessionUser();
    console.log(`>>> FAVORITES PAGE: ${sessionUser.email}`);
    const savedProperties: PropertyDocument[] = await fetchFavoritedProperties(sessionUser.id!);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Profile", href: "/profile" },
                    { label: "Favorite Properties", href: "/properties/favorites", active: true }
                ]}
            />
            <PropertiesList properties={savedProperties} />
        </main>
    );
}
 
export default FavoritePropertiesPage;