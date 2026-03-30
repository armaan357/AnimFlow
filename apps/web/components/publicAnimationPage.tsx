"use client";
import { Button } from "@repo/ui/button";
import { PublicChatPageHeader } from "./header";
import "../app/page.module.css";
import { ChevronDown, ChevronUp, Copy, Download } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import VideoPlayer from "./videoPlayer";
import toast, { Toaster } from "react-hot-toast";
import { PublicChatGreeting } from "@repo/ui/chatGreeting";
import { VersionSideBar } from "./versionSideBar";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const downloadURL = `https://res.cloudinary.com/${cloudName}/video/upload/fl_attachment/`;

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

export default function PublicAnimationPage({
	checkMobileDevice,
}: {
	checkMobileDevice: boolean;
}) {
	// const [isSideBarVisible, setSideBarVisible] = useState<boolean>(true);
	// const [chats, setChats] = useState<{ id: string; title: string }[] | null>(
	// 	null,
	// );
	const [messages, setMessages] = useState<MessageType[] | null>(null);
	const [isPolling, setIsPolling] = useState<boolean>(false);
	const [isVersionTabVisible, setVersionTabVisible] =
		useState<boolean>(false);
	const [messageToDisplay, setMessageToDisplay] =
		useState<MessageType | null>(null);

	const currAnimationId = useRef<string>("");
	// const inpRef = useRef<HTMLTextAreaElement>(null);
	const scrollToBottomRef = useRef<HTMLDivElement>(null);
	const taskIdRef = useRef<string | null>(null);

	const params = useParams<{ animationId: string }>();

	currAnimationId.current = params.animationId;

	useEffect(() => {
		scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		const fetchChat = async () => {
			try {
				const resp = await axios.get(
					`/api/backend/user/chats/public/${currAnimationId.current}`,
					{ withCredentials: true },
				);
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
			} catch (e: any) {}
		};
		fetchChat();
	}, []);

	useEffect(() => {
		if (!isPolling || taskIdRef.current == null) return;

		const fetchStatus = async () => {
			try {
				const taskId = taskIdRef.current?.split('"')[1];
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
					taskIdRef.current = null;
					setIsPolling(false);
				}
			} catch (e: any) {}
		};
		const interval = setInterval(fetchStatus, 5000);
		return () => clearInterval(interval);
	}, [isPolling]);

	return (
		<div className="bg-[#121212] flex w-full h-dvh">
			<Toaster />
			<div className="flex flex-col flex-1 w-full overflow-hidden">
				<PublicChatPageHeader />

				<div className="flex flex-row  flex-1 min-h-0 relative bg-[#121212] transition-transform duration-150 ease-in-out">
					<div className="w-full flex-1 flex flex-col  overflow-hidden transition-transform duration-150 ease-in-out">
						<div
							className={`flex overflow-y-auto sm:pl-25 pb-2.5 version-scroll-box transition-transform duration-150 ease-in-out h-full relative`}
						>
							<VersionSideBar
								isVersionTabVisible={isVersionTabVisible}
								onClose={() => setVersionTabVisible((v) => !v)}
								messages={messages}
								setMessageToDisplay={setMessageToDisplay}
								messageToDisplay={messageToDisplay}
								checkMobileDevice={checkMobileDevice}
							/>
							<div className="flex flex-1 overflow-y-auto scroll-box justify-center pb-4 md:pb-6 md:pr-6 lg:pb-8 lg:pr-8 pl-0.5 pt-0">
								<div className="max-w-auto w-[90%] sm:w-[70%]  sm:ml-20 flex flex-col gap-8 pt-19 pb-4">
									{/* Placeholder welcome message or content */}
									{!messages ? (
										<PublicChatGreeting />
									) : (
										<div className="flex flex-col gap-1 items-end">
											{messageToDisplay && (
												<PromptAndResponseContainer
													// key={mess}
													m={messageToDisplay}
												/>
											)}
										</div>
									)}
								</div>
								<div ref={scrollToBottomRef}></div>
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
}

const PromptAndResponseContainer = ({ m }: PromptAndResponseContainerProps) => {
	const count = useRef<number>(0);
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
							className="cursor-pointer text-white/70"
							onClick={() => copyPromptAction(m.prompt)}
							aria-label="Copy"
							data-tooltip="Copy"
						>
							<Copy size={18} />
						</div>
					</div>
				</div>

				<div className="sm:px-2.5 sm:py-1.5 w-73 md:w-112.5 lg:w-lg self-center sm:self-start bg-transparent border-none">
					{m.animationId ? (
						<div className=" w-auto">
							{m?.videoURL && m.taskId ? (
								<div className="sm:flex msg-container">
									<VideoPlayer
										publicId={m.taskId}
										versionId={m.versionNo}
										count={count.current++}
									/>
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
