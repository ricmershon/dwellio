import type { PropertyDocument } from '@/app/models';
import PropertiesList from '@/app/ui/properties/properties-list';
import { fetchProperties } from '@/app/lib/data/property-data';

const HomePageProperties = async () => {
    // Three most recent properties
    const recentProperties: PropertyDocument[] = await fetchProperties(true);

    return (
        <div className='p-4'>
            <PropertiesList properties={recentProperties} />
        </div>
    );
}
 
export default HomePageProperties;