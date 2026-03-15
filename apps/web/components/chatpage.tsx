"use client";
import { Button } from "@repo/ui/button";
import { ChatPageHeader } from "./header";
import "../app/page.module.css";
import {
	ArrowUp,
	ChevronDown,
	ChevronUp,
	Copy,
	Download,
	MenuIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { TextAreaComp } from "@repo/ui/textArea";
import VideoPlayer from "./videoPlayer";
import toast, { Toaster } from "react-hot-toast";
import { ChatGreeting } from "@repo/ui/chatGreeting";
import { Sidebar } from "./newSideBarComp/sidebar";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const downloadURL = `https://res.cloudinary.com/${cloudName}/video/upload/fl_attachment/`;

const deleteChat = async (chatId: string) => {
	try {
		const resp = await axios.delete(`${backendUrl}user/chats/${chatId}`, {
			withCredentials: true,
		});
		if (!resp) {
			toast("Error during chat deletion. Please try again later", {
				style: {
					background: "#343434",
					color: "#ffffff",
					paddingLeft: 35,
					paddingRight: 35,
					gap: 20,
				},
				position: "bottom-left",
			});
			return;
		}
		toast("Chat deleted successfully", {
			style: {
				background: "#343434",
				color: "#ffffff",
				paddingLeft: 35,
				paddingRight: 35,
				gap: 20,
			},
			position: "bottom-left",
		});
	} catch (e: any) {
		toast("Error during chat deletion. Please try again later", {
			style: {
				background: "#343434",
				color: "#ffffff",
				paddingLeft: 35,
				paddingRight: 35,
				gap: 20,
			},
			position: "bottom-left",
		});
	}
};

type MessageType = {
	id: string;
	animationId?: string;
	taskId?: string;
	prompt: string;
	versionNo: number;
	videoURL?: string;
	status?: string;
	errorMessage?: string;
	errorReason?: string;
	renderTimeMs?: number;
	fileSizeBytes?: number;
	durationSeconds?: number;
};

export default function ChatAnimationPage({
	userName,
	currentAnimationId,
	checkMobileDevice,
}: {
	userName: string;
	currentAnimationId: string;
	checkMobileDevice: boolean;
}) {
	const [isSideBarVisible, setSideBarVisible] = useState<boolean>(true);
	const [chats, setChats] = useState<{ id: string; title: string }[] | null>(
		null,
	);
	const [messages, setMessages] = useState<MessageType[] | null>(null);
	const [isPolling, setIsPolling] = useState<boolean>(false);
	const [isVersionTabVisible, setVersionTabVisible] =
		useState<boolean>(false);
	const [messageToDisplay, setMessageToDisplay] =
		useState<MessageType | null>(null);

	const animationId = useRef<string>("");
	const inpRef = useRef<HTMLTextAreaElement>(null);
	const scrollToBottomRef = useRef<HTMLDivElement>(null);
	const taskIdRef = useRef<string | null>(null);

	const params = useParams<{ animationId: string }>();

	animationId.current = params.animationId;

	useEffect(() => {
		scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resp = await axios.get(`${backendUrl}user/chats`, {
					withCredentials: true,
				});
				const allChats: { id: string; title: string }[] =
					await resp.data.dbResp;
				setChats(allChats);
			} catch (e: any) {
				console.log("error: ", e);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchChat = async () => {
			try {
				const resp = await axios.get(
					`${backendUrl}user/chats/${animationId.current}`,
					{ withCredentials: true },
				);
				console.log("chat resp = ", resp.data);
				const allVersions = resp.data.versions;
				setMessages(allVersions);
				setMessageToDisplay(resp.data.currentVersion);
				if (
					messages &&
					(messages.at(-1)?.status == undefined ||
						messages.at(-1)?.status === "PENDING")
				) {
					taskIdRef.current = allVersions.at(-1);
					setIsPolling(true);
				}
				console.log("messages after first fetch: ", messages);
			} catch (e: any) {
				console.log("error: ", e);
			}
		};
		fetchChat();
	}, []);

	useEffect(() => {
		if (!isPolling || taskIdRef.current == null) return;

		const fetchStatus = async () => {
			try {
				const taskId = taskIdRef.current?.split('"')[1];
				const status = await axios.post(
					`${backendUrl}user/chats/poll`,
					{ taskId },
					{ withCredentials: true },
				);
				if (status.data.code !== 2) {
					const animationDetails = status.data.animationDetails;
					const allMsgs = messages;
					const len = allMsgs?.length;
					if (allMsgs && len) allMsgs[len - 1] = animationDetails;
					setMessages(allMsgs);
					taskIdRef.current = null;
					setIsPolling(false);
				}
			} catch (e: any) {
				console.log("error: ", e);
			}
		};
		const interval = setInterval(fetchStatus, 5000);
		return () => clearInterval(interval);
	}, [isPolling]);

	const submitPrompt = async () => {
		if (inpRef.current && inpRef.current.value.trim()) {
			const userPrompt = inpRef.current.value;
			inpRef.current.value = "";
			const body = {
				userPrompt,
				videoResolution: "l",
			};
			try {
				const resp = await axios.post(
					`${backendUrl}generate/${animationId.current}`,
					body,
					{ withCredentials: true },
				);
				console.log("resp from generate = ", resp.data);
				if (resp.data.code == 0) {
					taskIdRef.current = resp.data.taskId;
					const allMsg = messages;
					allMsg?.push({
						id: "tempId",
						prompt: userPrompt,
						versionNo: messages ? messages?.length + 1 : 1,
					});
					console.log("allmsgs = ", allMsg);
					setMessages(allMsg);
					setIsPolling(true);
				}
			} catch (e: any) {
				console.log("error: ", e);
			}
		}
	};

	return (
		<div className="bg-[#121212] flex w-full h-dvh">
			<Toaster />
			{/* <SideBar
				isSideBarVisible={isSideBarVisible}
				onClose={() => setSideBarVisible(!isSideBarVisible)}
				chats={chats}
				userName={userName}
				currentAnimationId={currentAnimationId}
			/> */}
			<Sidebar
				isSideBarVisible={isSideBarVisible}
				isMobile={checkMobileDevice}
				onClose={() => setSideBarVisible(!isSideBarVisible)}
				onDeleteChat={(chatId) => deleteChat(chatId)}
				chats={chats}
				userName={userName}
				currentAnimationId={currentAnimationId}
			/>
			{checkMobileDevice && (
				<div
					className="sticky left-0 top-0 bg-[#0c0c0c] active:border-none border-none focus-within:border-none h-15 flex justify-center items-center pl-2.5 pr-1.5"
					onClick={() => setSideBarVisible(!isSideBarVisible)}
				>
					<MenuIcon color="white" />
				</div>
			)}
			<div className="flex flex-col flex-1 w-full overflow-hidden">
				<ChatPageHeader />

				<div className="flex flex-row flex-1 min-h-0 relative bg-[#121212] transition-transform duration-150 ease-in-out">
					<div className="w-full flex-1 flex flex-col overflow-hidden transition-transform duration-150 ease-in-out">
						{/* Messages Area */}
						<div
							className={`flex overflow-y-auto pb-2.5 version-scroll-box transition-transform duration-150 ease-in-out h-full ${isVersionTabVisible ? " relative " : ""}`}
						>
							{/* {!isVersionTabVisible ? (
								<div
									className="transition-transform  ease-in-out max-w-56 w-full h-12.5 cursor-pointer bg-[#181818] border border-white/10 hover:bg-[#232323] flex justify-center items-center px-1.5 py-0 absolute"
									onClick={() => setVersionTabVisible(true)}
								>
									<div className="flex w-full px-3 py-0.5">
										<p className="text-lg ">Version Tab</p>
									</div>
								</div>
							) :  */}

							<VersionSideBar
								isVersionTabVisible={isVersionTabVisible}
								onClose={() => setVersionTabVisible((v) => !v)}
								messages={messages}
								setMessageToDisplay={setMessageToDisplay}
								messageToDisplay={messageToDisplay}
							/>
							{/* } */}
							<div className="flex flex-1 overflow-y-auto scroll-box pb-4 pr-4 md:pb-6 md:pr-6 lg:pb-8 lg:pr-8 pl-0.5 pt-0">
								<div className="max-w-auto w-[70%] ml-20 flex flex-col gap-8 pb-4 pt-4 md:pt-6 lg:pt-8">
									{/* Placeholder welcome message or content */}
									{!messages ? (
										<ChatGreeting />
									) : (
										<div className="flex flex-col gap-1 items-end">
											{messageToDisplay && (
												<PromptAndResponseContainer
													// key={mess}
													m={messageToDisplay}
												/>
											)}
											{/* {messages.map((m, index) => (
												<PromptAndResponseContainer
													key={index}
													m={m}
												/>
											))} */}
										</div>
									)}
								</div>
								<div ref={scrollToBottomRef}></div>
							</div>
						</div>

						{/* Input Area */}
						<div className="w-full p-4 bg-[#121212] ">
							<div className="max-w-3xl mx-auto">
								<form
									className="relative flex flex-col bg-[#181818] border border-[#ffffff15] rounded-xl overflow-hidden focus-within:border-[#488AED]/15 transition-colors duration-150 ease-in-out"
									onSubmit={async (e) => {
										e.preventDefault();
										submitPrompt();
									}}
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											if (!e.shiftKey) {
												e.preventDefault();
												submitPrompt();
											}
										}
									}}
								>
									<div className="p-2">
										<TextAreaComp
											ref={inpRef}
											placeholder="Describe your animation..."
											className="min-h-15 max-h-50 w-full bg-transparent border-none focus:ring-0 resize-none px-3 py-2 text-white placeholder-gray-500"
										/>
									</div>
									<div className="flex justify-between items-center px-4 py-2 bg-[#181818]">
										<div className="flex gap-2 text-gray-500">
											{/* Optional tools/buttons could go here */}
										</div>
										<Button
											variant="primary"
											size="icon"
											className="h-8 w-8 rounded-lg"
											disabled={isPolling}
											children={
												<ArrowUp
													color="black"
													size={18}
												/>
											}
										/>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const VersionSideBar = ({
	isVersionTabVisible,
	onClose,
	messages,
	setMessageToDisplay,
	messageToDisplay,
}: {
	isVersionTabVisible: boolean;
	onClose: () => void;
	messages: MessageType[] | null;
	setMessageToDisplay: Dispatch<SetStateAction<MessageType | null>>;
	messageToDisplay: MessageType | null;
}) => {
	const scrollToActiveVersion = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (scrollToActiveVersion.current == null) return;
		// const id = `#${scrollToActiveVersion.current}`;
		scrollToActiveVersion.current.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}, [messageToDisplay, isVersionTabVisible]);
	return (
		<div
			className={`max-h-full h-fit transition-transform duration-200 ease-in-out rounded-tr-lg rounded-br-lg ${isVersionTabVisible && " pb-1.5 "} flex flex-col w-54 bg-[#202020] border border-white/2`}
		>
			<div className="flex flex-row justify-between items-center p-2 transition-transform duration-200 ease-in-out">
				<div
					className={`flex items-center w-full px-3 py-0.5 transition-transform duration-200 ease-in-out`}
				>
					{!isVersionTabVisible ? (
						<>
							{messageToDisplay?.versionNo && (
								<div className="flex justify-center items-center font-medium">
									{/* <p className="text-lg">Current Version:</p> */}
									<p className="text-base text-white/80 tracking-widest cursor-default">
										v{messageToDisplay?.versionNo}
									</p>
								</div>
							)}
						</>
					) : (
						<div className="flex justify-center items-center font-medium">
							{/* <p className="text-lg">Current Version:</p> */}
							<p className="text-base text-white/50 tracking-wide">
								VERSIONS
							</p>
						</div>
					)}
				</div>
				{/* {isVersionTabVisible && ( */}
				<div className="flex items-center w-fit">
					<Button
						variant="icon"
						size="icon"
						children={
							!isVersionTabVisible ? (
								<ChevronDown />
							) : (
								<ChevronUp />
							)
						}
						onClick={() => onClose()}
					/>
				</div>
				{/* )} */}
			</div>
			{isVersionTabVisible && (
				<div className="transition-transform duration-150 ease-in-out w-full border-b border-white/5"></div>
			)}
			{isVersionTabVisible && (
				<div className="transition-transform duration-150 ease-in-out flex flex-col overflow-y-auto items-center w-full p-1 version-scroll-box">
					<div className="relative w-full left-0 top-0 z-1">
						{messages &&
							messages.map((m, index) => (
								<div
									key={index}
									id={m.id}
									onClick={() => {
										if (!messages) return;
										const msg: MessageType | undefined =
											messages.find(
												(message) => message.id == m.id,
											);
										setMessageToDisplay(msg ?? null);
									}}
									ref={
										messageToDisplay &&
										m.id === messageToDisplay.id
											? scrollToActiveVersion
											: null
									}
									className={`flex flex-col justify-center items-center`}
								>
									{/* <div className="absolute left-4.25 w-0.75 z-1 border-none bg-white/10 h-full"></div> */}
									<div
										className={`flex gap-5 items-center z-100 w-full pt-3 px-1 pb-9 ${messageToDisplay && messageToDisplay.id === m.id ? "bg-[#ffffff07] border-r-2 border-[#488AED]/50 " : " bg-transparent "}  hover:bg-[#272727] rounded-sm cursor-pointer relative`}
									>
										{/* <div>
											{m.status &&
												m.status === "COMPLETED" && (
													// <Check size={1} />
													<div
														className={`p-0.75 z-100 w-fit h-fit rounded-full bg-green-600`}
													></div>
												)}
											{m.status &&
												m.status === "ERROR" && (
													// <X size={1} />
													<div
														className={`p-0.75 z-100 w-fit h-fit rounded-full bg-red-600`}
													></div>
												)}
											{m.status &&
												m.status === "PENDING" && (
													// <Loader size={1} />
													<div
														className={`p-1.5 z-100 w-fit h-fit rounded-full bg-gray-800/40`}
													></div>
												)}
											{!m.status && <Loader size={18} />}
										</div> */}
										<div
											className={`flex gap-3 w-auto overflow-x-hidden justify-center items-center transition-colors duration-150 ease-in-out`}
										>
											<div className="flex justify-center w-full overflow-hidden items-center py-3">
												<div className="flex flex-col w-full overflow-hidden pl-2.5">
													<div>
														<p
															className={`${messageToDisplay && messageToDisplay.id == m.id ? " text-white/90" : "text-white/65"} text-sm font-medium tracking-widest`}
														>
															v{m.versionNo}
														</p>
													</div>
													<span
														className={`${messageToDisplay && messageToDisplay.id == m.id ? " text-white/65" : "text-white/45"} text-base truncate font-normal`}
													>
														{m.prompt}
													</span>
													{m.status === "ERROR" && (
														<span className="text-red-300/25 text-xs">
															Failed
														</span>
													)}
													{m.status === "PENDING" && (
														<span className="text-white/25 text-xs">
															Processing...
														</span>
													)}
												</div>
											</div>
										</div>
									</div>

									{messages &&
										m.id !==
											messages[messages.length - 1]
												?.id && (
											<div className="w-[90%] border-b border-white/5 my-1"></div>
										)}
								</div>
							))}
					</div>
					<div className="h-1.5 bg-transparent"></div>
				</div>
			)}
		</div>
	);
};

interface PromptAndResponseContainerProps {
	m: MessageType;
}

const PromptAndResponseContainer = ({ m }: PromptAndResponseContainerProps) => {
	return (
		<div className="w-full">
			<div
				id={m.id}
				className="px-2 py-3 lg:px-4 lg:py-6 w-full flex flex-col gap-2.5"
			>
				<div className="flex w-fit gap-1.5 self-end-safe flex-col bg-transparent msg-container">
					<div className="px-2 py-1 sm:px-3 sm:py-1.5 w-fit max-w-lg self-end-safe bg-[#212121] border border-white/10 rounded-lg">
						<p className="text-base">{m.prompt}</p>
					</div>
					<div className="hidden-buttons flex w-full justify-end pr-4 container">
						<div
							className="cursor-pointer text-white/70 hover:bg-[#202020] transition-colors rounded-lg w-8 h-8 flex justify-center items-center"
							aria-label="Copy"
							// title="Copy"
							data-tooltip="Copy"
							onClick={() => copyPromptAction(m.prompt)}
						>
							<Copy size={18} />
						</div>
					</div>
				</div>

				<div className="sm:px-2.5 sm:py-1.5 w-73 md:w-112.5 lg:w-lg self-center sm:self-start bg-transparent border-none">
					{m.animationId ? (
						<div className=" w-auto">
							{m?.videoURL && m.taskId ? (
								<div className="flex msg-container">
									<div className="border-2 w-full border-white/25 rounded-lg overflow-hidden">
										<VideoPlayer publicId={m.taskId} />
									</div>
									<div className="flex items-center justify-center px-1.5 transition-all duration-150 hidden-buttons">
										<a
											href={`${downloadURL}${m.taskId}.mp4`}
											download={"video"}
											className="container"
										>
											<div
												className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#202020] transition-colors cursor-pointer"
												aria-label="Download Video"
												data-tooltip="Download"
											>
												<Download size={20} />
											</div>
										</a>
									</div>
								</div>
							) : (
								<p className="test-base">
									Error! {m.errorReason} Please try again
									later.
								</p>
							)}
						</div>
					) : (
						<p className="text-base text-white/75">Processing...</p>
					)}
				</div>
			</div>
		</div>
	);
};

const copyPromptAction = (prompt: string) => {
	navigator.clipboard.writeText(prompt).then(() => {
		const copyMsgToast = () =>
			toast("Prompt copied", {
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
