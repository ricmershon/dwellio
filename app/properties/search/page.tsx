import dbConnect from '@/app/config/database-config';
import { Property } from '@/app/models';

interface SearchResultsPageProps {
    searchParams: Promise<{
        location: string;
        propertyType: string
    }>
}

const SearchResultsPage = async (props: SearchResultsPageProps) => {
    const { location, propertyType } = await props.searchParams;

    await dbConnect();

    const locationRegex = new RegExp(location, 'i');
    
    let propertyTypeRegex;
    if (propertyType && propertyType !== 'All') {
        propertyTypeRegex = new RegExp(propertyType, 'i');
    }

    const query = {
        $or: [
            { name: locationRegex },
            { description: locationRegex },
            { 'location.street': locationRegex },
            { 'location.city': locationRegex },
            { 'location.state': locationRegex },
            { 'location.zip': locationRegex },
        ],
        type: propertyTypeRegex
    }

    const propertyQueryResults = await Property.find(query);
    console.log(propertyQueryResults);

    return (
        <div>Search results page</div>
    );
}
 
export default SearchResultsPage;