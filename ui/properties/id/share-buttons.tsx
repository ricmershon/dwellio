"use client";

import {
    FacebookShareButton, FacebookIcon,
    LinkedinShareButton, LinkedinIcon,
    TwitterShareButton, TwitterIcon
} from "react-share";

import { PropertyDocument } from "@/models";

const ShareButtons = ({ property }: { property: PropertyDocument}) => {
    const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/properties/${property._id}`;
    return (
        <>
            <div className="flex gap-1 justify-center mr-2">
                <FacebookShareButton url={shareUrl} hashtag={`#${property.type.replace(/\s/g, "")}ForRent`}>
                    <FacebookIcon size={20} round={true} />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} hashtags={[`${property.type.replace(/\s/g, "")}ForRent`]}>
                    <TwitterIcon size={20} round={true} />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl}>
                    <LinkedinIcon size={20} round={true} />
                </LinkedinShareButton>
            </div>
            <p className="mr-1">Share</p>
        </>
    );
}
 
export default ShareButtons;