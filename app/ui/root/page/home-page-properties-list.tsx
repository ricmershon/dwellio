import type { PropertyDocument } from '@/app/models';
import PropertiesList from '@/app/ui/properties/properties-list';
import { fetchRecentProperties } from '@/app/lib/data/property-data';

const HomePageProperties = async () => {
    // Three most recent properties
    const recentProperties: PropertyDocument[] = await fetchRecentProperties(6);

    return (
        <div className="mb-8">
            <PropertiesList properties={recentProperties} />
        </div>
    );
}
 
export default HomePageProperties;