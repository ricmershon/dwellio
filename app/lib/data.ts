import dbConnect from "@/app/config/database-config"
import { Property } from "@/app/models/property-model";
import { PropertyInterface, PropertyInterfaceWithId } from "@/app/lib/definitions";
import { HydratedDocument } from "mongoose";

export const fetchProperties = async (mostRecent: boolean) => {
    try {
        // Artificial delay for testing loading components.
        // console.log('Fetching data...')
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data received...')
        
        await dbConnect();
        let properties: Array<PropertyInterfaceWithId> = [];

        if (mostRecent) {
            properties = await Property.find().sort({ createdAt: -1 }).limit(3);
        } else {
            properties = await Property.find();
        }
        return properties;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch property data.')
    }
}

export const fetchPropertyById = async (propertyId: string) => {
    let property: HydratedDocument<PropertyInterface> | null;
    
    try {
        await dbConnect();
        property = await Property.findById(propertyId);
        if (!property) {
            console.log('>>> Property not found.')
        }
    } catch (error) {
        console.error('Error finding property: ', error);
        throw new Error("Error finding property");
    }

    return property;
}

export const fetchPropertiesByUserId = async (userId: string) => {
    let properties: Array<PropertyInterfaceWithId> | null;

    try {
        await dbConnect();
        properties = await Property.find({ owner: userId });
        if (!properties) {
            console.log('>>> Property not found.')
        }
    } catch (error) {
        console.error('Error finding properties: ', error);
        throw new Error("Error finding properties");
    }

    return properties;
}