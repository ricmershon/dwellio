import PropertyCardSkeleton from "@/app/ui/skeletons/property-card-skeleton";

const PropertiesListSkeleton = async () => (
    <section>
        <div className='container-xl lg:container m-auto'>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <PropertyCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        </div>
    </section>
);

export default PropertiesListSkeleton;