import { Suspense } from "react";

import PropertySearchForm from "@/ui/properties/search-form";

const Hero = () => {
    return (
        <section className="pt-20 mb-8">
            <div
                className="max-w-7xl mx-auto flex flex-col items-center"
            >
                <div className="text-center">
                    <h1
                        className="text-4xl font-extrabold sm:text-5xl md:text-6xl"
                    >
                        The Best Vacation Rentals
                    </h1>
                    <h2 className="mt-4 text-2xl">
                        Discover the perfect property.*
                    </h2>
                    <hr className="w-full border-t mt-2 border-gray-200"/>
                    <p className="mt-2">
                        *This web site was developed by {""}
                        <span>
                            <a
                                className="text-blue-800"
                                href="https://github.com/ricmershon"
                                target="_blank"
                            >
                                Ric Mershon
                            </a>
                        </span>
                        , and is for a
                    </p>
                    <p>
                        fictitious company. It&apos;s sole purpose is to demonstrate my full
                    </p>
                    <p>
                        stack application skills with Next, React, Tailwind and MongoDB.
                    </p>
                    <p className="mt-2">
                        (<span>
                            <a
                                className="text-blue-800 mt-"
                                href="https://github.com/ricmershon/dwellio"
                                target="_blank"
                            >
                                Code can be found here
                            </a>

                        </span>.)
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