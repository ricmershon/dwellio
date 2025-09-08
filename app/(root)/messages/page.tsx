import { Metadata } from "next";

import { fetchMessages } from "@/lib/data/message-data";
import MessageCard from "@/ui/messages/message-card";
import { MessageDocument } from "@/models";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { requireSessionUser } from "@/utils/require-session-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Messages"
}

const MessagesPage = async () => {
    const sessionUser = await requireSessionUser();
    const messages: MessageDocument[] | null = await fetchMessages(sessionUser.id!);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Your Messages", href: "/messages", active: true }
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