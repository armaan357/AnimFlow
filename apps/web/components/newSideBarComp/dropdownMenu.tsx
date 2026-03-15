"use client";

import { useEffect, useRef, useState } from "react";

interface DropdownMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onShare: () => void;
	onDelete: () => void;
	position?: { top: number; right: number };
}

export function DropdownMenu({
	isOpen,
	onClose,
	onShare,
	onDelete,
	position = { top: 0, right: 0 },
}: DropdownMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(-1);

	useEffect(() => {
		if (!isOpen) {
			setActiveIndex(-1);
			return;
		}

		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((prev) => (prev < 1 ? prev + 1 : 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (activeIndex === 0) {
					onShare();
				} else if (activeIndex === 1) {
					onDelete();
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, activeIndex, onClose, onShare, onDelete]);

	if (!isOpen) return null;

	return (
		<div
			ref={menuRef}
			role="menu"
			className="fixed z-50 bg-[#18181B] border border-[#27272A] rounded-xl shadow-lg py-1.5 px-1.5 min-w-48"
			style={{
				top: `${position.top}px`,
				right: `${position.right}px`,
			}}
		>
			<button
				role="menuitem"
				onClick={() => {
					onShare();
					onClose();
				}}
				onMouseEnter={() => setActiveIndex(0)}
				className={`w-full text-center px-6 py-2 text-sm transition-colors rounded-lg duration-150 ${
					activeIndex === 0
						? "bg-[#27272A] text-[#FAFAFA]"
						: "text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#FAFAFA]"
				}`}
				aria-label="Share chat"
			>
				Share
			</button>
			<button
				role="menuitem"
				onClick={() => {
					onDelete();
					onClose();
				}}
				onMouseEnter={() => setActiveIndex(1)}
				className={`w-full px-6 py-2 rounded-lg text-center text-sm transition-colors duration-150 ${
					activeIndex === 1
						? "bg-red-600/20 text-red-400"
						: "text-red-400/60 hover:bg-red-600/20 hover:text-red-400"
				}`}
				aria-label="Delete chat"
			>
				Delete
			</button>
		</div>
	);
}
