import Link from 'next/link';

import { PropertyInterfaceWithId } from '@/app/lib/definitions';
import PropertiesList from '@/app/components/PropertiesList';
import { fetchProperties } from '@/app/lib/data';

const HomePageProperties = async () => {
    // Three most recent properties
    const recentProperties: Array<PropertyInterfaceWithId> = await fetchProperties(true);

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