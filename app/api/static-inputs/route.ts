import { NextResponse } from "next/server";

import dbConnect from "@/lib/db-connect";
import StaticInputModel from "@/models/static-inputs-model";

export const runtime = "nodejs";

export async function GET() {
    try {
        await dbConnect();
        
        const staticInputs = await StaticInputModel.findOne().lean().exec();
        return NextResponse.json(staticInputs ?? { amenities: [], property_types: [] }, { status: 200 });
    } catch (error) {
        console.error(`>>> Database error fetching static inputs: ${error}`);
        throw new Error(`Failed to fetch static inputs: ${error}`);
    }
}
