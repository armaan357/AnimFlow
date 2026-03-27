"use client";

import { useEffect, useRef } from "react";

interface DeleteModalProps {
	isOpen: boolean;
	chatId: string;
	onClose: () => void;
	onConfirm: (chatId: string) => void;
}

export function DeleteModal({
	isOpen,
	chatId,
	onClose,
	onConfirm,
}: DeleteModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
		} else {
			dialogRef.current?.close();
		}
	}, [isOpen]);

	const handleConfirm = () => {
		onConfirm(chatId);
		onClose();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose();
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className="backdrop:bg-black/50 mx-auto my-auto w-80 sm:w-87 md:w-92 rounded-lg border border-[#27272A] bg-[#0F0F10] p-6 shadow-lg"
			onKeyDown={handleKeyDown}
			onCancel={onClose}
		>
			<div className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold text-[#FAFAFA]">
					Delete this chat?
				</h2>
				<p className="text-sm text-[#A1A1AA]">
					This action cannot be undone.
				</p>

				<div className="flex gap-3 justify-end pt-2 sm:pt-3 md:pt-4">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-md text-sm font-medium text-[#FAFAFA] bg-[#18181B] hover:bg-[#27272A] transition-colors duration-150 cursor-pointer"
						aria-label="Cancel delete"
					>
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-700 hover:bg-red-500 transition-colors duration-150 cursor-pointer"
						aria-label="Confirm delete"
					>
						Delete
					</button>
				</div>
			</div>
		</dialog>
	);
}
