"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const MapSkeleton = ({ height }: { height: number }) => (
    <SkeletonTheme
        baseColor="#f7f8fb"
        highlightColor="white"
    >
        <div className={`relative w-full h-[${height.toString()}px] overflow-hidden bg-gray-100`}>
            {/* Main map base */}
            <Skeleton height="100%" width="100%" />

            {/* Fake pin clusters */}
            <div className="absolute top-[20%] left-[30%]">
                <Skeleton circle width={14} height={14} />
            </div>
            <div className="absolute top-[60%] left-[40%]">
                <Skeleton circle width={10} height={10} />
            </div>
            <div className="absolute top-[50%] left-[70%]">
                <Skeleton circle width={12} height={12} />
            </div>
        </div>
    </SkeletonTheme>
);

export default MapSkeleton;