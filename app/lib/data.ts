import { HydratedDocument } from "mongoose";

import dbConnect from "@/app/config/database-config"
import { Property, PropertyInterface } from "@/app/models";

export const fetchProperties = async (mostRecent: boolean) => {
    try {
        // Artificial delay for testing loading components.
        // console.log('Fetching data...')
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data received...')
        
        await dbConnect();
        let properties;

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
    let properties;

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