import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const PropertyCardSkeleton = () => (
    <SkeletonTheme
        baseColor='#f7f8fb'
        highlightColor='white'
    >
        <div className="rounded-md shadow-md bg-white">
            <div className="relative">
                {/* Image skeleton */}
                <Skeleton height={120} width="100%" borderRadius="0.375rem 0.375rem 0 0" />

                {/* Rate badge over image */}
                <div className="absolute top-[10px] left-[10px]">
                    <Skeleton height={20} width={60} borderRadius={6} />
                </div>
            </div>

            <div className="p-4 text-xs md:text-sm text-gray-500">
                {/* Bed and Bath */}
                <div className="flex justify-center gap-4 mb-2">
                    <Skeleton height={16} width={48} />
                    <Skeleton height={16} width={48} />
                </div>

                {/* Divider */}
                <div className="border border-gray-100 my-4" />

                {/* Type and location */}
                <div className="text-center">
                    <Skeleton height={16} width={140} />
                </div>
            </div>
        </div>
    </SkeletonTheme>
);

export default PropertyCardSkeleton;