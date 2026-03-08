"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./button";

export const Modal = ({
	isOpen,
	header,
	children,
	onClose,
}: {
	isOpen: boolean;
	header?: ReactNode;
	children: ReactNode;
	onClose: () => void;
}) => {
	const [mounted, setMounted] = useState(false);
	const elRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		elRef.current = document.body;
		if (!isOpen) return;
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = "unset";
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	// if (!isOpen) return null;

	return mounted && isOpen
		? createPortal(
				<div
					className="fixed top-0 h-screen inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-5000 "
					onClick={() => onClose()}
				>
					<div
						className="bg-[#181818] p-6 rounded-lg shadow-2xl flex flex-col backdrop-blur-md sm:max-w-[95vw] md:max-w-sm max-h-[90vh] gap-3 pb-12"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="absolute top-3 right-3">
							<Button
								variant="icon"
								children={<X size={25} />}
								size="icon"
								onClick={() => onClose()}
							/>
						</div>
						<div>{children}</div>
					</div>
				</div>,
				elRef.current!,
			)
		: null;
};
