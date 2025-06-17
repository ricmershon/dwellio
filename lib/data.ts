import connectDB from "@/config"
import { Property, PropertyInterface } from "@/models/Property";

export const fetchProperties = async (mostRecent: boolean) => {
    try {
        // Artificial delay for testing loading components.
        // console.log('Fetching data...')
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data received...')
        
        await connectDB();
        let properties: Array<PropertyInterface> = [];

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
    let property: PropertyInterface | null;
    
    try {
        await connectDB();
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