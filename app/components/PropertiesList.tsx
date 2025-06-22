import { PropertyInterface } from "@/app/models";
import PropertyCard from "@/app/components/PropertyCard";

const PropertiesList = ({ properties }: { properties: Array<PropertyInterface>}) => (
    <section className='px-4 py-6'>
        <div className='container-xl lg:container m-auto px-4 py-6'>
            <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
                Recent Properties
            </h2>
            {properties.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property._id.toString()}
                            property={property}
                        />
                    ))}
                </div>
            ) : (
                <p>No properties found</p>
            )}
        </div>
    </section>
);
 
export default PropertiesList;