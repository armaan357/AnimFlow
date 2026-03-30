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
import { VersionSideBar } from "./versionSideBar";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const downloadURL = `https://res.cloudinary.com/${cloudName}/video/upload/fl_attachment/`;

const deleteChat = async (chatId: string) => {
	try {
		const resp = await axios.delete(`/api/backend/user/chats/${chatId}`, {
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
	checkMobileDevice,
}: {
	userName: string;
	checkMobileDevice: boolean;
}) {
	const [isSideBarVisible, setSideBarVisible] =
		useState<boolean>(!checkMobileDevice);
	const [chats, setChats] = useState<{ id: string; title: string }[] | null>(
		null,
	);
	const [messages, setMessages] = useState<MessageType[] | null>(null);
	const [isPolling, setIsPolling] = useState<boolean>(false);
	const [isVersionTabVisible, setVersionTabVisible] =
		useState<boolean>(false);
	const [messageToDisplay, setMessageToDisplay] =
		useState<MessageType | null>(null);
	const [loadingMsg, setLoadingMsg] = useState<string | null>(null);

	const currAnimationId = useRef<string>("");
	const inpRef = useRef<HTMLTextAreaElement>(null);
	const scrollToBottomRef = useRef<HTMLDivElement>(null);
	const taskIdRef = useRef<string | null>(null);

	const params = useParams<{ animationId: string }>();

	currAnimationId.current = params.animationId;

	useEffect(() => {
		scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resp = await axios.get(`/api/backend/user/chats`, {
					withCredentials: true,
				});
				const allChats: { id: string; title: string }[] =
					await resp.data.dbResp;
				setChats(allChats);
			} catch (e: any) {}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchChat = async () => {
			try {
				const resp = await axios.get(
					`/api/backend/user/chats/${currAnimationId.current}`,
					{ withCredentials: true },
				);
				const allVersions = resp.data.versions;
				setMessages(allVersions);
				setMessageToDisplay(resp.data.currentVersion);
				if (
					resp.data.currentVersion &&
					(resp.data.currentVersion.status == undefined ||
						resp.data.currentVersion.status === "PENDING")
				) {
					taskIdRef.current = resp.data.currentVersion.taskId;
					setLoadingMsg("Rendering your animation...");
					setIsPolling(true);
				}
			} catch (e: any) {}
		};
		fetchChat();
	}, []);

	useEffect(() => {
		if (!isPolling || taskIdRef.current == null) return;

		const fetchStatus = async () => {
			try {
				const taskId = taskIdRef.current;
				const status = await axios.post(
					`/api/backend/user/chats/poll`,
					{ taskId },
					{ withCredentials: true },
				);
				if (status.data.code !== 2) {
					const animationDetails = status.data.animationDetails;
					const allMsgs = messages;
					const len = allMsgs?.length;
					if (allMsgs && len) allMsgs[len - 1] = animationDetails;
					setMessages(allMsgs);
					setMessageToDisplay(animationDetails);
					taskIdRef.current = null;
					setLoadingMsg(null);
					setIsPolling(false);
					// const currentMsgToDisplay  = messages && messages.length > 1 && messages[messages.length - 1] ? messages[messages?.length - 1] : null;
				}
			} catch (e: any) {}
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
				setLoadingMsg("Generating code from AI...");
				const resp = await axios.post(
					`/api/backend/generate/${currAnimationId.current}`,
					body,
					{ withCredentials: true },
				);
				if (resp.data.code == 0) {
					taskIdRef.current = resp.data.taskId;
					const allMsg = messages;
					allMsg?.push({
						id: "tempId",
						prompt: userPrompt,
						versionNo:
							messages &&
							messages[messages?.length - 1]?.versionNo
								? messages[messages?.length - 1]?.versionNo!
								: 1,
					});
					setMessages(allMsg);
					setMessageToDisplay({
						id: "tempId",
						prompt: userPrompt,
						versionNo:
							messages &&
							messages[messages?.length - 1]?.versionNo
								? messages[messages?.length - 1]?.versionNo! + 1
								: 1,
					});
					setLoadingMsg("Rendering your animation...");
					setIsPolling(true);
				}
			} catch (e: any) {}
		}
	};

	return (
		<div className="bg-[#121212] flex w-full h-dvh">
			<Toaster />
			<Sidebar
				isSideBarVisible={isSideBarVisible}
				isMobile={checkMobileDevice}
				onClose={() => setSideBarVisible(!isSideBarVisible)}
				onDeleteChat={(chatId) => deleteChat(chatId)}
				chats={chats}
				userName={userName}
				currentAnimationId={currAnimationId.current}
			/>
			<div className="flex flex-col flex-1 w-full overflow-hidden">
				<div className="w-full flex">
					{checkMobileDevice && (
						<div
							className="sticky left-0 top-0 bg-[#0c0c0c] active:border-none border-none focus-within:border-none h-15 flex justify-center items-center pl-2.5 pr-1.5"
							onClick={() => setSideBarVisible(!isSideBarVisible)}
						>
							<MenuIcon color="white" />
						</div>
					)}
					<ChatPageHeader />
				</div>
				{/* <ChatPageHeader /> */}

				<div className="flex flex-row flex-1 min-h-0 relative bg-[#121212] transition-transform duration-150 ease-in-out">
					<div className="w-full flex-1 flex flex-col overflow-hidden transition-transform duration-150 ease-in-out">
						{/* Messages Area */}
						<div
							className={`flex overflow-y-auto pb-2.5 relative version-scroll-box transition-transform duration-150 ease-in-out h-full `}
						>
							<VersionSideBar
								isVersionTabVisible={isVersionTabVisible}
								onClose={() => setVersionTabVisible((v) => !v)}
								messages={messages}
								setMessageToDisplay={setMessageToDisplay}
								messageToDisplay={messageToDisplay}
								checkMobileDevice={checkMobileDevice}
							/>
							{/* } */}
							<div className="flex flex-1 overflow-y-auto scroll-box pb-4 justify-center md:pb-6 lg:pb-8 pl-0.5 pt-0">
								<div className="max-w-auto w-[90%] sm:w-[70%] flex flex-col gap-8 pb-4 pt-19">
									{/* Placeholder welcome message or content */}
									{!messages ? (
										<ChatGreeting />
									) : (
										<div className="flex flex-col gap-1 items-end">
											{messageToDisplay && (
												<PromptAndResponseContainer
													// key={mess}
													m={messageToDisplay}
													loadingMsg={loadingMsg}
													checkMobileDevice={
														checkMobileDevice
													}
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

interface PromptAndResponseContainerProps {
	m: MessageType;
	loadingMsg: string | null;
	checkMobileDevice: boolean;
}

const PromptAndResponseContainer = ({
	m,
	loadingMsg,
}: PromptAndResponseContainerProps) => {
	const count = useRef<number>(0);
	return (
		<div className="w-full">
			<div
				id={m.id}
				className="px-2 py-3 lg:px-4 lg:py-6 w-full pt-0 flex flex-col gap-2.5"
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
							{m?.videoURL && m.taskId && (
								<div className={` sm:flex sm:msg-container`}>
									<VideoPlayer
										publicId={m.taskId}
										versionId={m.versionNo}
										count={count.current++}
									/>
								</div>
							)}
							{m.taskId && m.status === "PENDING" && (
								<p className="text-base text-white/75">
									{loadingMsg ? loadingMsg : "Processing..."}
								</p>
							)}
							{(!m.taskId || !m.videoURL) &&
								m.status !== "PENDING" && (
									<p className="test-base">
										Error! {m.errorReason} Please try again
										later.
									</p>
								)}
						</div>
					) : (
						<p className="text-base text-white/75">
							{loadingMsg ? loadingMsg : "Processing..."}
						</p>
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
