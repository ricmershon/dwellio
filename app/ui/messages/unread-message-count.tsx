const UnreadMessageCount = ( {unreadCount }: { unreadCount: number }) => {
    return (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-[18px] w-[18px] text-[12px] leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
        </span>
    );
}
 
export default UnreadMessageCount;