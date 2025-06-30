import Link from 'next/link';
import { FaArrowAltCircleLeft } from 'react-icons/fa';
import { Types } from 'mongoose';

import PropertyCard from '@/app/ui/properties/property-card';
import PropertySearchForm from '@/app/ui/properties/search/search-form';
import PropertiesList from '@/app/ui/properties/properties-list';
import { PropertiesQuery } from '@/app/lib/definitions';
import { findProperties } from '@/app/lib/data';

interface SearchResultsPageProps {
    searchParams: Promise<{
        location: string;
        propertyType: string
    }>
}

const SearchResultsPage = async (props: SearchResultsPageProps) => {
    const searchParams = await props.searchParams;
    const { location, propertyType } = searchParams;
    const locationRegex = new RegExp(location, 'i');
    
    const query: PropertiesQuery = {
        $or: [
            { name: locationRegex },
            { description: locationRegex },
            { 'location.street': locationRegex },
            { 'location.city': locationRegex },
            { 'location.state': locationRegex },
            { 'location.zip': locationRegex },
        ]
    }
    
    /**
     * If the property type is not `All`, add the `type` key and the regex for
     * `properType` to the query object.
     */
    if (propertyType && propertyType !== 'All') {
        const propertyTypeRegex = new RegExp(propertyType, 'i');
        Object.assign(query, { type: propertyTypeRegex });
    }

    const propertiesQueryResults = await findProperties(query);

    return (
        <>
            <section className="bg-blue-700 py-4">
                <div className="max-width-7xl mx-auto px-4 flex flex-col tems-start sm:px-6 lg:px-8">
                    <PropertySearchForm />
                </div>
            </section>
            <section className="px-4 py-6">
                <div className="container-xl lg:container m-auto px-4 py-6">
                    <Link
                        href='/properties'
                        className='flex items-center text-blue-500 hover:underline mb-3'
                    >
                        <FaArrowAltCircleLeft className='mr-2'/>
                        Back to Properties
                    </Link>
                    <h1 className="text-2xl mb-4">Search Results</h1>
                    {PropertiesList.length === 0 ? (
                        <p>No search results</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {propertiesQueryResults.map((property) => (
                                <PropertyCard
                                    key={(property._id as Types.ObjectId).toString()}
                                    property={property}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
 
export default SearchResultsPage;