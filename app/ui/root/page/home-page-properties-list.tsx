import Link from 'next/link';

import type { PropertyDocument } from '@/app/models';
import { fetchProperties } from '@/app/lib/data/property-data';
import PropertyCard from '../../properties/property-card';

const HomePageProperties = async () => {
    // Three most recent properties
    const recentProperties: PropertyDocument[] = await fetchProperties(true);

    return (
        <>
            <section>
                <div className='container-xl lg:container m-auto'>
                    {recentProperties.length !== 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-10 sm:px-10 md:px-20 lg:px-30">
                            {recentProperties.map((property) => (
                                <PropertyCard
                                    key={(property._id as string).toString()}
                                    property={property}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No properties found</p>
                    )}
                </div>
            </section>
            <section className='m-auto max-w-lg my-6 px-6'>
                <Link href='/properties' className='block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700'>
                    View All Properties
                </Link>
            </section>
        </>
    );
}
 
export default HomePageProperties;