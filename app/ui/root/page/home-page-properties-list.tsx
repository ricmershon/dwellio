import Link from 'next/link';

import type { PropertyInterface } from '@/app/models';
import PropertiesList from '@/app/ui/properties/properties-list';
import { fetchProperties } from '@/app/lib/data/property-data';

const HomePageProperties = async () => {
    // Three most recent properties
    const recentProperties: Array<PropertyInterface> = await fetchProperties(true);

    return (
        <>
            <PropertiesList properties={recentProperties} />
            <section className='m-auto max-w-lg my-6 px-6'>
                <Link href='/properties' className='block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700'>
                    View All Properties
                </Link>
            </section>
        </>
    );
}
 
export default HomePageProperties;