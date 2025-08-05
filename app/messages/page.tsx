import { getSessionUser } from "@/app/utils/get-session-user";
import { fetchMessages } from "@/app/lib/data/message-data";
import MessageCard from "@/app/ui/messages/message-card";
import { MessageDocument } from "@/app/models";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";

const MessagesPage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const messages: MessageDocument[] | null = await fetchMessages(sessionUser.id);

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