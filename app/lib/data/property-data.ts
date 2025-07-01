import { HydratedDocument } from "mongoose";

import dbConnect from "@/app/config/database-config"
import { Property, PropertyInterface, User, UserInterface } from "@/app/models";
import { MAX_ITEMS_PER_PAGE, PropertiesQuery } from "@/app/lib/definitions";

export const fetchProperties = async (mostRecent: boolean) => {
    try {
        // Artificial delay for testing loading components.
        // console.log('Fetching data...')
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data received...')
        
        await dbConnect();
        let properties: PropertyInterface[] | null;

        if (mostRecent) {
            properties = await Property.find().sort({ createdAt: -1 }).limit(3);
        } else {
            properties = await Property.find();
        }
        return properties;
    } catch (error) {
        throw new Error(`Failed to fetch property data: ${error}`)
    }
}

export const fetchPropertyById = async (propertyId: string) => {
    let property: HydratedDocument<PropertyInterface> | null;
    
    try {
        await dbConnect();
        property = await Property.findById(propertyId);
        if (!property) {
            console.error('>>> Property not found.')
        }
    } catch (error) {
        throw new Error(`Error finding property: ${error}`);
    }

    return property;
}

export const fetchPropertiesByUserId = async (userId: string) => {
    let properties: Array<PropertyInterface> | null;

    try {
        await dbConnect();
        properties = await Property.find({ owner: userId });
        if (!properties) {
            console.log('>>> Property not found.')
        }
    } catch (error) {
        throw new Error(`Error finding properties: ${error}`);
    }

    return properties;
}

export const fetchSavedProperties = async (userId: string) => {
    let user: UserInterface;

    try {
        await dbConnect();
        user = await User.findById(userId).populate('bookmarks');
    } catch (error) {
        throw new Error(`Error finding bookmarked properties: ${error}`);
    }

    const bookmarks: Array<PropertyInterface> = user.bookmarks;
    return bookmarks;
}

export const searchProperties = async (query: PropertiesQuery) => {
    let properties: Array<PropertyInterface>;

    try {
        await dbConnect();
        properties = await Property.find(query)
        if (!properties) {
            throw new Error('Error querying the database for properties.');
        }
    } catch (error) {
        throw new Error(`Error querying the database for properties: ${error}`)
    }

    return properties;
}

export const fetchNumPropertiesPages = async () => {
    try {
        await dbConnect();
        const totalProperties = await Property.countDocuments();
        const totalPages = Math.ceil(totalProperties) / MAX_ITEMS_PER_PAGE;
        return totalPages;
    } catch (error) {
        console.error(`Database error fetching number of properties pages: ${error}`);
        throw new Error('Failed to fetch total number of invoices.')
    }
}

export const fetchPaginatedProperties = async (currentPage: number) => {
    const offset = (currentPage - 1) * MAX_ITEMS_PER_PAGE;
    
    try {
        await dbConnect();
        const properties: PropertyInterface[] = await Property.find()
            .skip(offset)
            .limit(MAX_ITEMS_PER_PAGE);

        return properties;
    } catch (error) {
        console.error(`Database error fetching invoices: ${error}`);
        throw new Error('Failed to fetch invoices.')
    }
}