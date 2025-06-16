import Link from 'next/link';

import properties from '@/properties.json';
import PropertiesList from './PropertiesList';

const HomePageProperties = () => {
    /**
     * Slice out the three latest properties.
     */
    const recentProperties = properties
        .sort((a, b) => {
            const aDate = new Date(a.updatedAt);
            const bDate = new Date(b.updatedAt);
            if (aDate < bDate) {
                return -1
            } else if (aDate > bDate) {
                return 1
            }
            return 0;
        })
        .slice(0, 3);
    
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