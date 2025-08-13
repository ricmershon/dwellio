interface UnreadMessageCountProps {
    unreadCount: number;
    viewportWidth: number;
}

const UnreadMessageCount = ({ unreadCount, viewportWidth }: UnreadMessageCountProps) => (
    <span className="absolute top-1 right-1 inline-flex items-center justify-center size-[15px] md:size-[14px] text-[10px] leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
        {viewportWidth > 640 && unreadCount}
    </span>
);
 
export default UnreadMessageCount;