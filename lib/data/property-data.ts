import { HydratedDocument } from "mongoose";

import dbConnect from "@/lib/db-connect"
import { Property, PropertyDocument, User, UserDocument } from "@/models";
import { PropertiesQuery } from "@/types";

/**
 * Returns a single property from the database.
 * 
 * @param {string} propertyId - ObjectId in database for property.
 * @returns Promise<HydratedDocument<PropertyDocument>>
 */
export const fetchProperty = async (propertyId: string) => {
    try {
        await dbConnect();
        const property: HydratedDocument<PropertyDocument> | null = await Property.findById(propertyId);
        if (!property) {
            console.error(">>> Property not found.");
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
 * @returns Promise<PropertyDocument[]>
 */
export const fetchPropertiesByUserId = async (userId: string) => {
    try {
        await dbConnect();
        const properties: PropertyDocument[] | null = await Property.find({ owner: userId });
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching properties: ${error}`);
        throw new Error(`Failed to fetch properties data: ${error}`);
    }
}

/**
 * Returns properties marked as featured in the database.
 * 
 * @returns Promise<PropertyDocument[]>
 */
export const fetchFeaturedProperties = async (viewportWidth: number) => {
    let numProperties;

    if (viewportWidth < 768) {
        numProperties = 4;
    } else if (viewportWidth < 1024) {
        numProperties = 8;
    } else if (viewportWidth < 1280) {
        numProperties = 10;
    } else {
        numProperties = 12;
    }

    try {
        await dbConnect();
        const properties: PropertyDocument[] | null = await Property.find({ isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(numProperties);
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching featured properties: ${error}`);
        throw new Error(`Failed to fetch featured properties data: ${error}`);
    }
}

/**
 * Returns all properties in the database favorited by currently logged in user.
 * 
 * @param {string} userId - ObjectId in database for user/property owner.
 * @returns Promise<PropertyDocument[]>
 */
export const fetchFavoritedProperties = async (userId: string) => {
    try {
        await dbConnect();
        const user: UserDocument = await User.findById(userId).populate("favorites");
        const favorites: PropertyDocument[] = user.favorites;
        return favorites;
    } catch (error) {
        console.error(`>>> Database error fetching favorite properties: ${error}`);
        throw new Error(`Failed to fetch favorite properties data: ${error}`);
    }
}

/**
 * Returns all properties from the database based on a user query.
 * 
 * @param {PropertiesQuery} query - database query object.
 * @returns Promise<PropertyDocument[]>
 */
export const searchProperties = async (query: PropertiesQuery) => {
    try {
        await dbConnect();
        const properties: PropertyDocument[] | null = await Property.find(query)
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
export const fetchNumPropertiesPages = async (query: PropertiesQuery, viewportWidth: number) => {
    let maxItemsPerPage: number;

    if (viewportWidth < 640) {
        maxItemsPerPage = 8;
    } else if (viewportWidth < 768) {
        maxItemsPerPage = 10
    } else if (viewportWidth < 1024) {
        maxItemsPerPage = 12;
    } else {
        maxItemsPerPage = 15;
    }

    let totalProperties: number;

    try {
        await dbConnect();

        if (query) {
            totalProperties = await Property.countDocuments(query);
        } else {
            totalProperties = await Property.countDocuments()
        }

        const totalPages = Math.ceil(totalProperties / maxItemsPerPage);
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
 * @returns Promise<PropertyDocument[]>
 */
export const fetchPaginatedProperties = async (
    currentPage: number,
    viewportWidth: number,
    query?: PropertiesQuery,
) => {
    // Artificial delay for testing loading components.
    // console.log("Fetching data...")
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // console.log("Data received...")

    let maxItemsPerPage: number;

    if (viewportWidth < 640) {
        maxItemsPerPage = 8;
    } else if (viewportWidth < 768) {
        maxItemsPerPage = 10
    } else if (viewportWidth < 1024) {
        maxItemsPerPage = 12;
    } else if (viewportWidth < 1280) {
        maxItemsPerPage = 15;
    } else {
        maxItemsPerPage = 18
    }

    const offset = (currentPage - 1) * maxItemsPerPage;
    
    let properties: PropertyDocument[] | null;
    try {
        await dbConnect();

        if (query) {
            properties = await Property.find(query)
                .skip(offset)
                .limit(maxItemsPerPage);
        } else {
            properties = await Property.find()
                .skip(offset)
                .limit(maxItemsPerPage);
        }
        return properties;
    } catch (error) {
        console.error(`>>> Database error fetching properties: ${error}`);
        throw new Error(`Failed to fetch properties data: ${error}`);
    }
}