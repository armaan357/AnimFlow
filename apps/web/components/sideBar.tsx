"use client";

import { Button } from "@repo/ui/button";
import { Modal } from "@repo/ui/modal";
import axios from "axios";
import { Copy, MenuIcon, MoreHorizontalIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface SideBarProps {
	isSideBarVisible: boolean;
	onClose: () => void;
	chats:
		| {
				id: string;
				title: string;
		  }[]
		| null;
	userName: string;
	currentAnimationId?: string;
}

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const SideBar = ({
	isSideBarVisible,
	onClose,
	chats,
	userName,
	currentAnimationId,
}: SideBarProps) => {
	const [isMoreVisible, setMoreVisible] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

	const router = useRouter();
	const windowRef = useRef<HTMLDivElement>(null);
	// const recentChatsRef = useRef(new Map());
	const visibleMoreOptionId = useRef<string | null>(null);
	const moreOptionsTriggerRef = useRef(new Map());
	const moreOptionsPopOverRef = useRef(new Map());
	const URLPath = useRef<string | null>(null);
	// URLPath.current = usePathname();
	useEffect(() => {
		URLPath.current = window.location.href;
	}, []);

	// const handleMoreOptionsClose = useCallback(
	// 	(e: KeyboardEvent) => {
	// 		console.log("key press registered");
	// 		if (e.key === "Escape") {
	// 			setMoreVisible(false);
	// 		}
	// 		e.preventDefault();
	// 	},
	// 	[isMoreVisible, setMoreVisible],
	// );

	const toggleMoreOptionsVisibility = (id: string) => {
		if (!isMoreVisible) {
			visibleMoreOptionId.current = id;
		} else {
			visibleMoreOptionId.current = null;
		}
		setMoreVisible(!isMoreVisible);
	};

	const setTriggerRefs = (el: HTMLSpanElement, id: string) => {
		if (el) {
			moreOptionsTriggerRef.current.set(id, el);
		} else {
			moreOptionsTriggerRef.current.delete(id);
		}
	};

	const setPopOverRefs = (el: HTMLDivElement, id: string) => {
		if (el) {
			moreOptionsPopOverRef.current.set(id, el);
		} else {
			moreOptionsPopOverRef.current.delete(id);
		}
	};

	// useEffect(() => {
	// 	console.log("useEffect enter");
	// 	if (!isMoreVisible || !windowRef) return;
	// 	console.log("event about to be attached");
	// 	windowRef.current?.addEventListener("keydown", handleMoreOptionsClose);
	// 	windowRef.current?.addEventListener("mousedown", () =>
	// 		setMoreVisible(false),
	// 	);
	// 	console.log("event attached");
	// 	return () => {
	// 		windowRef.current?.removeEventListener(
	// 			"keydown",
	// 			handleMoreOptionsClose,
	// 		);
	// 		windowRef.current?.removeEventListener("mousedown", () =>
	// 			setMoreVisible(false),
	// 		);
	// 	};
	// }, [isMoreVisible, setMoreVisible]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				visibleMoreOptionId.current != null &&
				moreOptionsPopOverRef.current.get(
					visibleMoreOptionId.current!,
				) &&
				!moreOptionsPopOverRef.current
					.get(visibleMoreOptionId.current)
					.contains(event.target) &&
				!moreOptionsTriggerRef.current
					.get(visibleMoreOptionId.current)
					.contains(event.target) &&
				!isDeleteModalOpen
			) {
				setMoreVisible(false); // Close the popover if clicked outside
				// setDeleteModalOpen(false);
				visibleMoreOptionId.current = null;
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			className={`hidden md:flex flex-col ${isSideBarVisible ? "w-64" : "w-fit"} bg-[#0c0c0c] border-r border-[#ffffff15] h-full transition-all duration-150 ease-in-out overflow-x-visible`}
			ref={windowRef}
		>
			<div className="pt-7 pl-4 transition-all ease-in-out duration-150">
				<button
					onClick={() => onClose()}
					className="w-fit h-fit transition-colors ease-in-out duration-150 cursor-pointer rounded-full hover:bg-[#232323] p-2"
				>
					<span>{<MenuIcon />}</span>
				</button>
			</div>
			<div className="p-4">
				<Button
					variant={isSideBarVisible ? "icon" : "icon"}
					size={isSideBarVisible ? "full" : "icon"}
					className={`${isSideBarVisible ? " w-full" : " w-fit "} justify-start text-left mb-4`}
					onClick={() => router.push("new")}
				>
					<Plus color="white" />
					{isSideBarVisible && (
						<p className="text-white">
							<span className="ml-2">New Chat</span>
						</p>
					)}
				</Button>
			</div>
			<div
				className={`flex-1 ${isSideBarVisible ? "overflow-y-auto scroll-box overflow-x-visible" : "overflow-hidden"}  px-2 pb-4`}
			>
				{isSideBarVisible && (
					<div className="flex flex-col gap-1 overflow-x-visible">
						<p className="px-4 py-2 text-xs font-medium text-gray-400">
							Recent
						</p>
						{chats && (
							<div className="overflow-x-visible">
								{chats.map((c) => (
									<div
										key={c.id}
										className={`w-full  hover:bg-[#202020] hover:text-white/90 transition-colors flex rounded-lg gap-1 recent-chat-container ${currentAnimationId == c.id ? " bg-[#1a1a1a] text-white/90 " : " bg-transparent text-white/72 "} items-center`}
									>
										<button
											id={c.id}
											className={`flex items-center w-[80%] relative pr-1 text-sm text-left rounded-lg cursor-pointer  gap-2`}
											onClick={() => {
												if (isMoreVisible) return;
												router.push(`${c.id}`);
											}}
										>
											{/* <MessageSquare
											size={16}
											className="mr-3 text-gray-500 shrink-0"
										/> */}
											<span className="truncate text-sm w-full px-3 py-3">
												{c.title}
											</span>
											{isMoreVisible &&
												visibleMoreOptionId.current ==
													c.id && (
													<div
														className="w-fit z-10000"
														ref={(el) => {
															if (!el) return;
															setPopOverRefs(
																el,
																c.id,
															);
														}}
													>
														<MoreOptionsComponent
															URLPath={
																URLPath.current!
															}
															chatId={c.id}
															setMoreVisible={() =>
																setMoreVisible(
																	false,
																)
															}
															setDeleteModalOpen={() =>
																setDeleteModalOpen(
																	true,
																)
															}
															visibleMoreOptionId={
																visibleMoreOptionId
															}
														/>
													</div>
												)}
											{visibleMoreOptionId.current ==
												c.id && (
												<div
													onClick={(e) => {
														e.stopPropagation();
													}}
												>
													<DeleteModal
														isOpen={
															isDeleteModalOpen
														}
														onClose={() =>
															setDeleteModalOpen(
																false,
															)
														}
														chatId={c.id}
														title={c.title}
													/>
												</div>
											)}
										</button>
										<div
											className="hover:bg-[#272727] text-white w-fit h-fit rounded-md p-1 more-button flex items-center justify-center"
											onClick={(e) => {
												e.stopPropagation();
												// setMoreVisible(true);
												toggleMoreOptionsVisibility(
													c.id,
												);
											}}
											ref={(el) => {
												if (!el) return;
												setTriggerRefs(el, c.id);
											}}
										>
											<MoreHorizontalIcon />
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
			<div className="p-4 border-t border-[#ffffff15]">
				<div className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
					<div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
						{userName[0]}
					</div>
					{isSideBarVisible && (
						<div className="flex flex-col">
							<span className="font-medium text-white">
								{userName}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const MoreOptionsComponent = ({
	URLPath,
	chatId,
	setMoreVisible,
	setDeleteModalOpen,
	visibleMoreOptionId,
}: {
	URLPath: string;
	chatId: string;
	setMoreVisible: () => void;
	setDeleteModalOpen: () => void;
	visibleMoreOptionId: RefObject<string | null>;
}) => {
	return (
		<div className="py-1.5 px-2 bg-[#292929] shadow-md shadow-[#ffffff08] transition-shadow duration-200 ease-in-out hover:shadow-xl hover:shadow-[#ffffff08] absolute -right-10 -bottom-19  rounded-xl w-45 z-100000">
			<span
				className="bg-transparent border-0 text-[#ffffff90] hover:text-[#ffffff] flex justify-center items-center disabled:cursor-not-allowed hover:bg-[#2e2e2e] w-full px-6 py-2 rounded-xl cursor-pointer ease-in-out duration-150 transition-colors gap-2"
				onClick={() => {
					// setMoreVisible();
					// setDeleteModalOpen();
					copyPromptAction(chatId, URLPath);
				}}
				aria-label="Click to copy the public view link"
				title="Click to copy the public view link"
			>
				Share
				<Copy size={14} />
			</span>

			<span
				className="bg-transparent text-red-400/75 hover:bg-red-500/5 border-0 flex justify-center items-center disabled:cursor-not-allowed w-full px-6 py-2 rounded-xl cursor-pointer ease-in-out duration-150 transition-colors"
				onClick={() => {
					setMoreVisible();

					setDeleteModalOpen();
					visibleMoreOptionId.current = null;
				}}
			>
				Delete
			</span>
			{/* <Button variant="secondary" size="full" children="Share" />
			<Button variant="danger" size="full" children="Delete" /> */}
		</div>
	);
};

const DeleteModal = ({
	isOpen,
	onClose,
	chatId,
	title,
}: {
	isOpen: boolean;
	onClose: () => void;
	chatId: string;
	title: string;
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			children={
				<div className="px-4" onClick={(e) => e.stopPropagation()}>
					<div className="text-lg text-white/85">Delete Chat?</div>
					<div className="pt-5 flex w-full pb-10">
						<p className="text-base text-white/65 w-full">
							This will delete <strong>{`  ${title}`}</strong>
						</p>
					</div>
					<div className="flex gap-5">
						<Button
							variant="secondary"
							size="full"
							children={"Cancel"}
							onClick={() => onClose()}
						/>
						<button
							className="w-full px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-700 border-0 flex justify-center items-center disabled:cursor-not-allowed transition-all duration-150 ease-in-out cursor-pointer"
							onClick={async () => {
								console.log(
									"This will delete the chat with id = ",
									chatId,
								);
								const resp = await axios.delete(
									`${backendURL}user/chats/${chatId}`,
									{ withCredentials: true },
								);
							}}
						>
							Delete
						</button>
					</div>
				</div>
			}
		/>
	);
};

const copyPromptAction = async (chatId: string, URLPath: string) => {
	console.log("path = ", URLPath);
	const publicViewPath = `${URLPath.split("chat")[0]}public/${chatId}`;
	console.log("public path = ", publicViewPath);
	navigator.clipboard.writeText(publicViewPath).then(() => {
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
	});
};
