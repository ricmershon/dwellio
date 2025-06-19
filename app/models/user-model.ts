import { Document, Schema, model, models } from 'mongoose';

import { PropertyInterface } from './property-model';

export interface UserInterface extends Document {
    username: string;
    email: string;
    image: string;
    bookmarks: Array<PropertyInterface>
}

const UserSchema = new Schema({
    username: { type: String, required: [true, 'Username is required'], unique: true },
    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required']
    },
    image: { type: String },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
}, {
    timestamps: true
});

// export const User = models.User || model('User', userSchema);

export const User = models.User || model<UserInterface>('User', UserSchema);