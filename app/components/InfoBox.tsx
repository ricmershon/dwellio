import Link from "next/link";

interface InfoBoxProps {
    headingText: string;
    backgroundColor: string;
    buttonInfo: {
        link: string;
        styles: string
        text: string;
    };
    children: string;
}

const InfoBox = ({
    headingText,
    backgroundColor,
    buttonInfo,
    children
}: InfoBoxProps) => (
    <div className={`${backgroundColor} p-6 rounded-lg shadow-md`}>
        <h2 className="text-2xl font-bold">{headingText}</h2>
        <p className="mt-2 mb-4">
            {children}
        </p>
        <Link
            href={buttonInfo.link}
            className={`${buttonInfo.styles} text-white inline-block rounded-lg px-4 py-2`}
        >
            {buttonInfo.text}
        </Link>
    </div>
);
 
export default InfoBox;