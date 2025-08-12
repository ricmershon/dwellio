import dbConnect from "@/config/database-config";
import { StaticInputs, StaticInputsDocument } from "@/models";

/**
 * Returns static inputs for property types and amenities from the database.
 * 
 * @returns Promise<StaticInputsDocument>
 */
export const fetchStaticInputs = async () => {
    try {
        await dbConnect();
        const staticInputsDoc = await StaticInputs
            .findOne()
            .select({ amenities: 1, property_types: 1, _id: 0 })
            .lean<StaticInputsDocument>();

        const staticInputs: StaticInputsDocument = staticInputsDoc ?? { amenities: [], property_types: [] };
        return staticInputs;
    } catch (error) {
        console.error(`>>> Database error fetching static inputs: ${error}`);
        throw new Error(`Failed to fetch static inputs: ${error}`);
    }
}