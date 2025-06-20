import { Schema, model, models } from 'mongoose';

import { UserInterface } from '@/app/lib/definitions';

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