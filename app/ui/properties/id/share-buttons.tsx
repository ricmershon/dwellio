'use client';

import {
    FacebookShareButton, FacebookIcon,
    LinkedinShareButton, LinkedinIcon,
    TwitterShareButton, TwitterIcon
} from "react-share";

import { PropertyDocument } from "@/app/models";

const ShareButtons = ({ property }: { property: PropertyDocument}) => {
    const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/properties/${property._id}`;
    return (
        <>
            <h3 className="text-xl font-bold text-center pt-2">Share This Property</h3>
            <div className="flex gap-3 justify-center pb-5">
                <FacebookShareButton url={shareUrl} hashtag={`#${property.type.replace(/\s/g, '')}ForRent`}>
                    <FacebookIcon size={40} round={true} />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} hashtags={[`${property.type.replace(/\s/g, '')}ForRent`]}>
                    <TwitterIcon size={40} round={true} />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl}>
                    <LinkedinIcon size={40} round={true} />
                </LinkedinShareButton>
            </div>

        </>
    );
}
 
export default ShareButtons;