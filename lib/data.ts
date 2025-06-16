import connectDB from "@/config"
import { Property, PropertyInterface } from "@/models/Property";

export const fetchProperties = async (mostRecent: boolean) => {
    
    try {
        // Artificial delay for testing loading components.
        // console.log('Fetching data...')
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data received...')
        
        await connectDB();

        let data: Array<PropertyInterface> = [];

        if (mostRecent) {
            data = await Property.find().sort({ createdAt: -1 }).limit(3);
        } else {
            data = await Property.find();
        }
        return data;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch property data.')
    }
}