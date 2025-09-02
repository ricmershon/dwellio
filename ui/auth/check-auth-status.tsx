"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CheckAuthStatus = () => {
    const searchParams = useSearchParams();
    const [showAlert, setShowAlert] = useState(false);
    const [returnToPage, setReturnToPage] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("authRequired") === "true" && !searchParams.get("loggedOut")) {
            setShowAlert(true);
            if (searchParams.get("returnTo") !== null) {
                setReturnToPage(searchParams.get("returnTo"))
            }
        }
    }, [searchParams]);

    return (
        <>
            {showAlert && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
                    {`Please login to access the ${returnToPage} page.`}
                </div>

            )}
        </>
    );
}
 
export default CheckAuthStatus;