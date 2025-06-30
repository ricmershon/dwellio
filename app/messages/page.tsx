import { getSessionUser } from "@/app/utils/get-session-user";
import { fetchMessages } from "@/app/lib/data/message-data";
import MessageCard from "@/app/ui/messages/message-card";
import { MessageInterface } from "../models";

const MessagesPage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const messages: MessageInterface[] | null = await fetchMessages(sessionUser.id);
    console.log(messages);

    return (
        <main>
            <section className='bg-blue-50'>
                <div className="container m-auto py-24 max-w-6xl">
                    <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                        <h1 className="text-3xl font-bold mb-4">Your Messages</h1>
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <p>You have no messages.</p>
                            ) : (
                                messages.map((message) => (
                                    <MessageCard
                                        key={message._id as string}
                                        message={message}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
 
export default MessagesPage;