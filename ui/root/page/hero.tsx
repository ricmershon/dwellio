import PropertySearchForm from "@/ui/properties/search/search-form";
import { Suspense } from "react";

const Hero = () => {
    return (
        <section className="pt-20 mb-8">
            <div
                className="max-w-7xl mx-auto flex flex-col items-center"
            >
                <div className="text-center">
                    <h1
                        className="text-4xl font-extrabold text-gray-700 sm:text-5xl md:text-6xl"
                    >
                        Find The Perfect Rental
                    </h1>
                    <p className="my-4 text-xl text-gray-700">
                        Discover the perfect property.
                    </p>
                </div>
                <Suspense>
                    <PropertySearchForm />
                </Suspense>
            </div>
        </section>
    );
}
 
export default Hero;