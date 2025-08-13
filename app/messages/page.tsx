import { Metadata } from "next";

import { getSessionUser } from "@/utils/get-session-user";
import { fetchMessages } from "@/lib/data/message-data";
import MessageCard from "@/ui/messages/message-card";
import { MessageDocument } from "@/models";
import Breadcrumbs from "@/ui/shared/breadcrumbs";

export const metadata: Metadata = {
    title: 'Messages'
}

const MessagesPage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const messages: MessageDocument[] | null = await fetchMessages(sessionUser.id);

    console.log(messages);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Your Messages', href: '/messages', active: true }
                ]}
            />
            <div className="m-auto">
                <div className="space-y-5">
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
        </main>
    );
}
 
export default MessagesPage;