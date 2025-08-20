import { Schema, model, models } from "mongoose";

import { Amenity, OptionType } from "@/types/types";

export interface StaticInputsDocument {
  amenities: Amenity[];
  property_types: OptionType[];
}

const AmenitySchema = new Schema<Amenity>({
    id: { type: String, required: true },
    value: { type: String, required: true }
}, {
    _id: false
});

const PropertyTypesSchema = new Schema<OptionType>({
    value: { type: String, required: true },
    label: { type: String, required: true }
}, {
    _id: false
});

const StaticInputsSchema = new Schema<StaticInputsDocument>({
    amenities: {
        type: [AmenitySchema],
        required: true
    },
    property_types: {
        type: [PropertyTypesSchema],
        required: true
    }
});

const StaticInputs = models.StaticInputs || model<StaticInputsDocument>("StaticInputs", StaticInputsSchema);

export default StaticInputs;
