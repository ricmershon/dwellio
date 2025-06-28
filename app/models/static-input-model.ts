import { Schema, Document, model, models } from 'mongoose';

interface Amenity {
    id: string;
    value: string;
}

export interface StaticInputInterface extends Document {
    amenities: Amenity[];
    property_types: string[];
}

const AmenitySchema = new Schema<Amenity>({
    id: { type: String, required: true },
    value: { type: String, required: true }
}, {
    _id: false
});

const StaticInputSchema = new Schema<StaticInputInterface>({
    amenities: {
        type: [AmenitySchema],
        required: true
    },
    property_types: {
        type: [String],
        required: true
    }
});

const StaticInput = models.StaticInput || model<StaticInputInterface>('StaticInput', StaticInputSchema);
export default StaticInput;