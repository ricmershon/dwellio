"use client";

import Link from "next/link";
import { FaExclamationCircle } from "react-icons/fa";

const Error = ({ error }: { error: Error & { digest?: string }}) => (
    <section className="h-screen text-center flex flex-col jusitfy-center items-center">
        <div className="mt-10">
                <div className="flex justify-center">
                    <FaExclamationCircle className="text-3xl text-yellow-400" />
                </div>
                <div className="text-center mt-2">
                    <p className="font-medium text-lg mb-5">
                        {error.toString()}
                    </p>
                    <Link
                        href="/"
                        className="btn btn-primary"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        <div className="flex-grow"></div>
    </section>
);

export default Error;