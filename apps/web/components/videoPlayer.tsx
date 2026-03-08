"use client"; // Required for client-side components in App Router

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css"; // Import the necessary CSS
import React from "react";

interface VideoPlayerProps {
	publicId: string; // The public ID of the video in your Cloudinary account
	width?: string | number;
	height?: string | number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
	publicId,
	width = "500",
	height = "300",
}) => {
	return (
		<CldVideoPlayer
			id={publicId} // A unique ID for the video player instance
			width={width}
			height={height}
			src={publicId} // Use the public ID as the source
			// colors={{
			// 	base: "#00FFFFFF", // Optional: Customize the player's color scheme
			// 	text: "#ffffff",
			// 	accent: "#ffffff",
			// }}
			controls // Optional: Add default video controls
			// Add any other props or configurations here
			logo={false}
		/>
	);
};

export default VideoPlayer;
