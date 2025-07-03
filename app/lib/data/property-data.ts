import { HydratedDocument } from "mongoose";

import dbConnect from "@/app/config/database-config"
import { Property, PropertyInterface, User, UserInterface } from "@/app/models";
import { MAX_ITEMS_PER_PAGE, PropertiesQuery } from "@/app/lib/definitions";

/**
 * Returns all or three most recent properties in the database.
 * 
 * @param {boolean} mostRecent - if true return only 3 most recent properties.
 * @returns Promise<PropertyInterface[]>
 */
export const fetchProperties = async (mostRecent: boolean) => {
    // Artificial delay for testing loading components.
    // console.log('Fetching data...')
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // console.log('Data received...')

    try {        
        await dbConnect();
        let properties: PropertyInterface[];

        if (mostRecent) {
            properties = await Property.find().sort({ createdAt: -1 }).limit(3);
        } else {
            properties = await Property.find();
        }
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching properties: ${error}`);
        throw new Error(`Failed to fetch properties data: ${error}`);
    }
}

/**
 * Returns a single property from the database.
 * 
 * @param {string} propertyId - ObjectId in database for property.
 * @returns Promise<HydratedDocument<PropertyInterface>>
 */
export const fetchProperty = async (propertyId: string) => {
    try {
        await dbConnect();
        const property: HydratedDocument<PropertyInterface> | null = await Property.findById(propertyId);
        if (!property) {
            console.error('>>> Property not found.');
            throw new Error(`Failed to fetch property data.`)
        }
        return property;
    } catch (error) {
        console.error(`>>> Database error fetching property: ${error}`);
        throw new Error(`Failed to fetch property data: ${error}`);
    }
}

/**
 * Returns all properties in the database entered by currently logged in user.
 * 
 * @param {string} userId - ObjectId in database for user/property owner.
 * @returns Promise<PropertyInterface[]>
 */
export const fetchPropertiesByUserId = async (userId: string) => {
    try {
        await dbConnect();
        const properties: PropertyInterface[] | null = await Property.find({ owner: userId });
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching properties: ${error}`);
        throw new Error(`Failed to fetch properties data: ${error}`);
    }
}

/**
 * Returns properties marked as featured in the database.
 * 
 * @returns Promise<PropertyInterface[]>
 */
export const fetchFeaturedProperties = async () => {
    try {
        await dbConnect();
        const properties: PropertyInterface[] | null = await Property.find({ is_featured: true });
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching featured properties: ${error}`);
        throw new Error(`Failed to fetch featured properties data: ${error}`);
    }
}

/**
 * Returns all properties in the database bookmarked by currently logged in user.
 * 
 * @param {string} userId - ObjectId in database for user/property owner.
 * @returns Promise<PropertyInterface[]>
 */
export const fetchBookmarkedProperties = async (userId: string) => {
    try {
        await dbConnect();
        const user: UserInterface = await User.findById(userId).populate('bookmarks');
        const bookmarks: PropertyInterface[] = user.bookmarks;
        return bookmarks;
    } catch (error) {
        console.error(`>>> Database error fetching bookmarked properties: ${error}`);
        throw new Error(`Failed to fetch bookmarked properties data: ${error}`);
    }
}

/**
 * Returns all properties from the database based on a user query.
 * 
 * @param {PropertiesQuery} query - database query object.
 * @returns Promise<PropertyInterface[]>
 */
export const searchProperties = async (query: PropertiesQuery) => {
    try {
        await dbConnect();
        const properties: PropertyInterface[] | null = await Property.find(query)
        return properties;
    } catch (error) {
        console.error(`>>> Database error querying properties: ${error}`);
        throw new Error(`Failed to fetch query data: ${error}`);
    }
}

/**
 * Returns number of pages for property page pagination.
 * 
 * @returns Promise<number>
 */
export const fetchNumPropertiesPages = async () => {
    try {
        await dbConnect();
        const totalProperties = await Property.countDocuments();
        const totalPages = Math.ceil(totalProperties / MAX_ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error(`>>> Database error fetching document count: ${error}`);
        throw new Error(`Failed to fetch document count data: ${error}`);
    }
}

/**
 * Returns paginated properties from the database.
 * 
 * @param {number} currentPage - current page displayed.
 * @returns Promise<PropertyInterface[]>
 */
export const fetchPaginatedProperties = async (currentPage: number) => {
    const offset = (currentPage - 1) * MAX_ITEMS_PER_PAGE;
    
    try {
        await dbConnect();
        const properties: PropertyInterface[] = await Property.find()
            .skip(offset)
            .limit(MAX_ITEMS_PER_PAGE);
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching properties: ${error}`);
        throw new Error(`Failed to fetch properties data: ${error}`);
    }
}