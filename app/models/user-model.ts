import { Document, Schema, Types, model, models } from 'mongoose';

import { PropertyDocument } from '@/app/models/property-document';

export interface UserDocument extends Document {
    username: string;
    email: string;
    image: string;
    favorites: Types.ObjectId[] & PropertyDocument[]
}

const UserSchema = new Schema({
    username: { type: String, required: [true, 'Username is required'], unique: true },
    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required']
    },
    image: { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
}, {
    timestamps: true
});

const User = models.User || model<UserDocument>('User', UserSchema);
export default User;