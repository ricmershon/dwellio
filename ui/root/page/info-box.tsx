import Link from "next/link";
import React from "react";

interface InfoBoxProps {
    headingText: string;
    backgroundColor: string;
    buttonInfo: {
        link: string;
        styles: string
        text: string;
    };
    children: React.ReactNode;
}

const InfoBox = ({
    headingText,
    backgroundColor,
    buttonInfo,
    children
}: InfoBoxProps) => (
    <div className={`${backgroundColor} p-6 rounded-lg shadow-md`}>
        <h2 className="heading">{headingText}</h2>
        <div className="mt-2 mb-4">
            {children}
        </div>
        <Link
            href={buttonInfo.link}
            className={`${buttonInfo.styles} text-white btn`}
        >
            {buttonInfo.text}
        </Link>
    </div>
);
 
export default InfoBox;