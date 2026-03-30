"use client"; // Required for client-side components in App Router

import "next-cloudinary/dist/cld-video-player.css"; // Import the necessary CSS
import React, { useEffect, useState } from "react";
import "./../app/page.module.css";

interface VideoPlayerProps {
	publicId: string; // The public ID of the video in your Cloudinary account
	width?: string | number;
	height?: string | number;
	versionId: number;
	count: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
	publicId,
	width = "500",
	height = "300",
	versionId,
	count,
}) => {
	console.log(`${publicId}-${versionId}-${count}`);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
	}, [publicId]);
	return (
		<div
			className={`transition-opacity duration-1000 ${isLoading ? " opacity-0 " : " opacity-100 "} border-2 w-full border-white/25 max-w-200 aspect-video bg-black rounded-xl overflow-hidden relative`}
		>
			{isLoading && <div className="skeleton-content" />}
			<video
				key={`${publicId}-${versionId}`}
				controls
				preload="metadata"
				poster={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_1/${publicId}.jpg`}
				// width={380}
				// height={220}
				playsInline
				autoPlay
				muted
				className="w-full h-auto max-h-full object-contain transition-all duration-200"
				onLoadedData={() => setLoading(false)}
				onError={() => setLoading(false)}
			>
				<source
					src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,f_auto/${publicId}`}
					type="video/mp4"
				/>
				{/* <source src="video.webm" type="video/webm" />
				<source src="video.ogg" type="video/ogg" /> */}
				Your browser does not support the video tag.
			</video>
		</div>
	);
};

export default VideoPlayer;
