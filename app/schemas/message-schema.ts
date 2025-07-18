import { z } from 'zod';

export const MessageInput = z.object({
    name: z.string()
        .min(10, { message: 'Name must be at least 10 characters long.' }),
    email: z.email({ message: 'Enter a valid email address.' }),
    phone: z.string().nonempty({ message: 'Phone number is required.' }),
    body: z.string().nonempty({ message: 'Message is required.' })
});

export type MessageInputType = z.infer<typeof MessageInput>;