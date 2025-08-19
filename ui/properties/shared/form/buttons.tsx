import Link from "next/link";
import { LuRefreshCw } from "react-icons/lu";
import clsx from 'clsx';

interface PropertyFormButtonsProps {
    cancelButtonHref: string;
    isPending: boolean;
    primaryButtonText: string;
}
const PropertyFormButtons = ({ cancelButtonHref, isPending, primaryButtonText  }: PropertyFormButtonsProps) => {
    return (
        <div className="mt-4 flex justify-end gap-4">
            <Link
                href={cancelButtonHref}
                className="flex btn btn-secondary"
            >
                Cancel
            </Link>
            <button
                className={clsx(
                    'flex gap-1 btn btn-primary',
                    {
                        'hover:cursor-not-allowed': isPending,
                        'hover:cursor-pointer': !isPending
                    }
                )}
                type="submit"
                disabled={isPending}
            >
                {isPending && <LuRefreshCw className='btn-pending-icon icon-spin'/>}
                <span>{primaryButtonText}</span>
            </button>
        </div>        
    );
}
 
export default PropertyFormButtons;