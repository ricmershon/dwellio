import { MessageDocument } from "@/models";
import ToggleMessageReadButton from "@/ui/messages/toggle-message-read-button";
import DeleteMessageButton from "@/ui/messages/delete-message-button";

const MessageCard = ({ message }: { message: MessageDocument }) => (
    <div className="relative p-4 rounded-md text-sm shadow-md border border-gray-100">
        {!message.read && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 text-sm rounded-md">New</div>
        )}
        <h2 className="mb-4">
            <span className="font-bold">Property:</span>{" "}
            {typeof message.property === "object" && message.property !== null && "name" in message.property && message.property.name}
        </h2>
        <p>{message.body}</p>
        <ul className="mt-4">
            <li>
                <span className="font-bold">Reply Email: </span>
                <a href={`mailto:${message.email}`} className="text-blue-500">
                    {message.email}
                </a>
            </li>
            <li>
                <span className="font-bold">Reply Phone: </span>
                <a href={`tel:${message.phone}`} className="text-blue-500">
                    {message.phone}
                </a>
            </li>
            <li>
                <span className="font-bold">Received: </span>
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
 
export default MessageCard;