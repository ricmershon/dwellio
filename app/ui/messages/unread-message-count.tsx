const UnreadMessageCount = ( {unreadCount }: { unreadCount: number }) => {
    return (
        <span className="absolute bottom-[15px] left-[15px] inline-flex items-center justify-center size-[13px] text-[10px] leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
        </span>
    );
}
 
export default UnreadMessageCount;