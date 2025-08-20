"use client";

import ClipLoader from "react-spinners/ClipLoader";

const clipLoaderOverride = {
    display: "block",
    margin: "100px auto"
}

const Loading = () => {
    return (
        <ClipLoader
            color="#3b82f6"
            cssOverride={clipLoaderOverride}
            size={100}
            aria-label="Loading Spinner"
        />
    );
}
 
export default Loading;