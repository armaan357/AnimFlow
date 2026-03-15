"use client";

import { useRef } from "react";
import Link from "next/link";

interface ChatItemProps {
	id: string;
	title: string;
	isActive: boolean;
	onOpenMenu: (position: { top: number; right: number }) => void;
}

export function ChatItem({ id, title, isActive, onOpenMenu }: ChatItemProps) {
	const moreButtonRef = useRef<HTMLButtonElement>(null);

	const handleMenuClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (moreButtonRef.current) {
			const rect = moreButtonRef.current.getBoundingClientRect();
			onOpenMenu({
				top: rect.bottom + 4,
				right: window.innerWidth - rect.right,
			});
		}
	};

	return (
		<Link href={`/chat/${id}`}>
			<div
				className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#18181b] transition-colors duration-150 ${
					isActive ? " bg-[#131315] " : ""
				}`}
			>
				<div className="flex-1 min-w-0">
					<p
						className={`text-sm truncate ${
							isActive
								? "text-[#FAFAFA] font-medium"
								: "text-[#A1A1AA]"
						}`}
					>
						{title}
					</p>
				</div>

				<button
					ref={moreButtonRef}
					onClick={handleMenuClick}
					className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 hover:bg-[#27272A] rounded-md shrink-0"
					aria-label="Chat options"
					aria-haspopup="true"
				>
					<svg
						className="w-4 h-4 text-[#A1A1AA]"
						fill="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle cx="12" cy="5" r="1" />
						<circle cx="12" cy="12" r="1" />
						<circle cx="12" cy="19" r="1" />
					</svg>
				</button>
			</div>
		</Link>
	);
}
