import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const PropertyCardSkeleton = () => (
    <SkeletonTheme
        baseColor='#f7f8fb'
        highlightColor='white'
    >
        <div className="rounded-md shadow-md">
            {/* Image */}
            <Skeleton height={200} width="100%" className='w-full h-auto rounded-t-md' />

            <div className='p-[10px]'>
                <div className="flex justify-between items-center mb-2">
                    <Skeleton height={12} width={150} />
                    <Skeleton height={12} width={40} />
                </div>
                <div className="flex justify-between items-center mb-2">
                    <Skeleton height={16} width={150} />
                    <Skeleton height={12} width={40} />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton height={12} width={150} />
                    <Skeleton height={12} width={40} />
                </div>
            </div>
        </div>
    </SkeletonTheme>
);

export default PropertyCardSkeleton;