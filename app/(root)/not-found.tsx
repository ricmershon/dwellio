export default function NotFound() {
    return (
        <section className="h-screen text-center flex flex-col jusitfy-center items-center">
            <div>
                <h1 className="inline-block mt-10 mr-5 pr-5 font-medium align-top leading-12 border-r border-gray-800 text-2xl">
                    404
                </h1>
                <div className="inline-block">
                    <h2 className="font-medium text-lg leading-12 mt-10">
                        This page could not be found.
                    </h2>
                </div>
            </div>
        </section>
    );
}