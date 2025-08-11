import type { PropertyDocument } from '@/models';
import PropertiesList from '@/ui/properties/properties-list';
import { fetchRecentProperties } from '@/lib/data/property-data';

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