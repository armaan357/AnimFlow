"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChatItem } from "./chatItems";
import { DropdownMenu } from "./dropdownMenu";
import { DeleteModal } from "./deleteModal";
import toast from "react-hot-toast";

interface Chat {
	id: string;
	title: string;
}

interface SidebarProps {
	isSideBarVisible: boolean;
	isMobile: boolean;
	onClose: () => void;
	chats?: Chat[] | null;
	userName: string;
	currentAnimationId?: string;
	onDeleteChat?: (chatId: string) => void;
}

export function Sidebar({
	isSideBarVisible,
	isMobile,
	onClose,
	chats,
	userName,
	currentAnimationId,
	onDeleteChat,
}: SidebarProps) {
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	// Close menu when sidebar visibility changes
	useEffect(() => {
		if (!isSideBarVisible) {
			setOpenMenuId(null);
		}
	}, [isSideBarVisible]);

	const handleMenuOpen = useCallback(
		(chatId: string, position: { top: number; right: number }) => {
			setOpenMenuId(chatId);
			setMenuPosition(position);
		},
		[],
	);

	const handleShare = useCallback(() => {
		if (typeof window !== "undefined") {
			const shareUrl = `${window.location.origin}/public/${openMenuId}`;
			navigator.clipboard
				.writeText(shareUrl)
				.then(() => {
					const copyMsgToast = () =>
						toast("Public view link copied", {
							style: {
								background: "#343434",
								color: "#ffffff",
								paddingLeft: 35,
								paddingRight: 35,
								gap: 20,
							},
							position: "bottom-left",
						});
					copyMsgToast();
				})
				.catch(() => {
					toast("Failed to copy link", {
						style: {
							background: "#343434",
							color: "#ef563b99",
							paddingLeft: 35,
							paddingRight: 35,
							gap: 20,
						},
						position: "bottom-left",
					});
				});
		}
	}, [openMenuId]);

	const handleDelete = useCallback(() => {
		if (openMenuId) {
			setDeleteTargetId(openMenuId);
			setDeleteModalOpen(true);
			setOpenMenuId(null);
		}
	}, [openMenuId]);

	const handleConfirmDelete = useCallback(
		(chatId: string) => {
			onDeleteChat?.(chatId);
			setDeleteModalOpen(false);
			setDeleteTargetId(null);
		},
		[onDeleteChat],
	);

	const handleCloseModal = useCallback(() => {
		setDeleteModalOpen(false);
		setDeleteTargetId(null);
	}, []);

	const handleESC = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isMobile && isSideBarVisible) {
					onClose();
				}
				setOpenMenuId(null);
			}
		},
		[isMobile, isSideBarVisible, onClose],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleESC);
		return () => document.removeEventListener("keydown", handleESC);
	}, [handleESC]);

	// Desktop collapsed state
	if (!isMobile && !isSideBarVisible) {
		return (
			<aside className=" h-full w-16 bg-[#0a0a0a] border-r border-[#27272A] flex flex-col items-center py-4 gap-4 z-40">
				<button
					onClick={() => {
						onClose();
					}}
					className="p-2 hover:bg-[#18181B] rounded-md transition-colors duration-150"
					aria-label="Expand sidebar"
					title="Expand sidebar"
				>
					<svg
						className="w-5 h-5 text-[#A1A1AA]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<Link
					href="new"
					className="p-2 hover:bg-[#ffffff]/7 rounded-md transition-colors duration-150 text-[#A1A1AA] hover:text-white"
					aria-label="New chat"
					title="New chat"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</Link>

				<div className="mt-auto">
					<div
						className="w-8 h-8 rounded-full bg-[#18181B] flex items-center justify-center text-[#A1A1AA] text-sm font-semibold"
						title={userName}
					>
						{userName.charAt(0).toUpperCase()}
					</div>
				</div>
			</aside>
		);
	}

	// Mobile drawer
	if (isMobile && isSideBarVisible) {
		return (
			<>
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden"
					onClick={() => onClose()}
					aria-hidden="true"
				/>
				<aside className="fixed left-0 top-0 h-full w-64 bg-[#0A0A0A] border-r border-[#27272A] flex flex-col z-40 transform transition-transform duration-300">
					<SidebarContent
						userName={userName}
						currentAnimationId={currentAnimationId}
						chats={chats}
						onClose={onClose}
						onMenuOpen={handleMenuOpen}
						openMenuId={openMenuId}
					/>
				</aside>

				{openMenuId && (
					<DropdownMenu
						isOpen={Boolean(openMenuId)}
						onClose={() => setOpenMenuId(null)}
						onShare={handleShare}
						onDelete={handleDelete}
						position={menuPosition}
					/>
				)}

				{deleteTargetId && (
					<DeleteModal
						isOpen={deleteModalOpen}
						chatId={deleteTargetId}
						onClose={handleCloseModal}
						onConfirm={handleConfirmDelete}
					/>
				)}
			</>
		);
	}

	// Desktop expanded state
	if (!isMobile && isSideBarVisible) {
		return (
			<>
				<aside className=" h-full w-64 bg-[#0A0A0A] border-r border-[#27272A] flex flex-col z-40">
					<SidebarContent
						userName={userName}
						currentAnimationId={currentAnimationId}
						chats={chats}
						onClose={onClose}
						onMenuOpen={handleMenuOpen}
						openMenuId={openMenuId}
					/>
				</aside>

				{openMenuId && (
					<DropdownMenu
						isOpen={Boolean(openMenuId)}
						onClose={() => setOpenMenuId(null)}
						onShare={handleShare}
						onDelete={handleDelete}
						position={menuPosition}
					/>
				)}

				{deleteTargetId && (
					<DeleteModal
						isOpen={deleteModalOpen}
						chatId={deleteTargetId}
						onClose={handleCloseModal}
						onConfirm={handleConfirmDelete}
					/>
				)}
			</>
		);
	}

	return null;
}

interface SidebarContentProps {
	userName: string;
	currentAnimationId?: string;
	chats?: Chat[] | null;
	onClose: () => void;
	onMenuOpen: (
		chatId: string,
		position: { top: number; right: number },
	) => void;
	openMenuId: string | null;
}

function SidebarContent({
	userName,
	currentAnimationId,
	chats,
	onClose,
	onMenuOpen,
	openMenuId,
}: SidebarContentProps) {
	return (
		<div className="flex flex-col h-full">
			{/* Top Section */}
			<div className="flex items-center justify-between p-4 border-npne border-[#27272A]">
				{/* <h1 className="text-lg font-semibold text-[#FAFAFA]">
					AnimFlow
				</h1> */}
				<button
					onClick={() => {
						onClose();
					}}
					className="p-1.5 hover:bg-[#18181B] rounded-md transition-colors duration-150"
					aria-label="Close sidebar"
				>
					<svg
						className="w-5 h-5 text-[#A1A1AA]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>

			{/* Main Section */}
			<div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-y-4">
				{/* New Chat Button */}
				<Link
					href="new"
					className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-[#FAFAFA] rounded-md hover:bg-[#ffffff]/6 transition-colors duration-150 font-medium text-sm"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Chat
				</Link>

				{/* Recent Chats */}
				{chats && chats.length > 0 && (
					<div>
						<p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider px-1 pb-2">
							Recent
						</p>
						<div className="flex flex-col gap-1">
							{chats.map((chat) => (
								<ChatItem
									key={chat.id}
									id={chat.id}
									title={chat.title}
									isActive={chat.id === currentAnimationId}
									onOpenMenu={(position) =>
										onMenuOpen(chat.id, position)
									}
								/>
							))}
						</div>
					</div>
				)}

				{(!chats || chats.length === 0) && (
					<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
						<p className="text-sm text-[#71717A]">
							No recent chats
						</p>
						<p className="text-xs text-[#71717A] mt-1">
							Start a new chat to get started
						</p>
					</div>
				)}
			</div>

			{/* Bottom User Section */}
			<div className="border-t border-[#27272A] p-4 cursor-default">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#488aed] to-[#a1c4fd] flex items-center justify-center text-white text-sm font-bold shrink-0">
						{userName.charAt(0).toUpperCase()}
					</div>
					<p className="text-sm text-[#FAFAFA] truncate">
						{userName}
					</p>
				</div>
			</div>
		</div>
	);
}
