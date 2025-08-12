import dbConnect from "@/config/database-config";
import { StaticInputs, StaticInputsDocument } from "@/models";

export const fetchStaticInputs = async () => {
    try {
        await dbConnect();
        const doc = await StaticInputs
            .findOne()
            .select({ amenities: 1, property_types: 1, _id: 0 })
            .lean<StaticInputsDocument>()
            .exec();

        const staticInputs: StaticInputsDocument = doc ?? { amenities: [], property_types: [] };
        return staticInputs;
    } catch (error) {
        console.error(`>>> Database error fetching static inputs: ${error}`);
        throw new Error(`Failed to fetch static inputs: ${error}`);
    }
}