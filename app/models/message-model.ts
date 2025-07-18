import { Document, Schema, Types, model, models } from 'mongoose';
import { MessageInputType } from '@/app/schemas/message-schema';

export interface MessageDocument extends MessageInputType, Document {
    sender: Types.ObjectId,
    recipient: Types.ObjectId,
    property: Types.ObjectId | { _id: Types.ObjectId, name: string },
    read: boolean,
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: [true, 'Name is required'] },
    email: { type: String, required: [true, 'Email is required'] },
    phone: String,
    body: String,
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Message = models.Message || model<MessageDocument>('Message', MessageSchema);
export default Message;