import { MessageInterface } from "@/app/models";
import ToggleMessageReadButton from "@/app/ui/messages/toggle-message-read-button";
import DeleteMessageButton from "@/app/ui/messages/delete-message-button";

const MessageCard = ({ message }: { message: MessageInterface }) => {

    console.log(message);
    return (
        <div className="relative bg-white p-4 rounded-md shadow-md border border-gray-200">
            {!message.read && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md">New</div>
            )}
            <h2 className="text-xl mb-4">
                <span className="font-bold">Property Inquiry:</span>{' '}
                {typeof message.property === 'object' && 'name' in message.property && message.property.name}
            </h2>
            <p className="text-gray-799">{message.body}</p>
            <ul className="mt-4">
                <li>
                    <strong>Reply Email: </strong>{' '}
                    <a href={`mailto:${message.email}`} className='text-blue-500'>
                        {message.email}
                    </a>
                </li>
                <li>
                    <strong>Reply Phone: </strong>{' '}
                    <a href={`tel:${message.phone}`} className='text-blue-500'>
                        {message.phone}
                    </a>
                </li>
                <li>
                    <strong>Received: </strong>{' '}
                    {new Date(message.createdAt).toLocaleString()}
                </li>
            </ul>
            <ToggleMessageReadButton
                messageId={message._id as string}
                read={message.read}
            />
            <DeleteMessageButton messageId={message._id as string} />
        </div> 
    );
}
 
export default MessageCard;