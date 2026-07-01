"use client";
import { Button } from "@repo/ui/button";
import { ChatPageHeader } from "./header";
import "../app/page.module.css";
import { ArrowUp, Copy, MenuIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { TextAreaComp } from "@repo/ui/textArea";
import toast, { Toaster } from "react-hot-toast";
import { ChatGreeting } from "@repo/ui/chatGreeting";
import { Sidebar } from "./newSideBarComp/sidebar";
import { ResolutionSelectComponent } from "./resolutionSelect";

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

export default function NewChatAnimationPage({
	userName,
	checkMobileDevice,
}: {
	userName: string;
	checkMobileDevice: boolean;
}) {
	const [isSideBarVisible, setSideBarVisible] =
		useState<boolean>(!checkMobileDevice);
	// const [isNewSideBarVisible, setNewSideBarVisible] = useState<boolean>(true);
	const [chats, setChats] = useState<{ id: string; title: string }[] | null>(
		null,
	);
	const [promptMsg, setPromptMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [selectedResolution, setSelectedResolution] = useState<string>("l");
	const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

	const animationId = useRef<string>("");
	const inpRef = useRef<HTMLTextAreaElement>(null);
	const scrollToBottomRef = useRef<HTMLDivElement>(null);

	const params = useParams<{ animationId: string }>();

	animationId.current = params.animationId;

	const router = useRouter();

	const submitPrompt = async () => {
		if (inpRef.current && inpRef.current.value.trim()) {
			const userPrompt = inpRef.current.value;
			inpRef.current.value = "";
			const body = {
				userPrompt,
				videoResolution: selectedResolution,
			};
			setPromptMsg(userPrompt);
			try {
				const resp = await axios.post(
					`/api/backend/generate/new`,
					body,
					{
						withCredentials: true,
					},
				);
				if (resp.data.code == 0) {
					router.push(`${resp.data.animationId}`);
				}
			} catch (e: any) {
				setErrorMsg(e.reason ? e.reason : "Internal Server Error");
			}
		}
	};

	useEffect(() => {
		scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [promptMsg]);

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

	const handleSuggestionClick = (str: string) => {
		if (!inpRef.current) return;

		inpRef.current.value = str;
		inpRef.current.focus();
		inpRef.current.setSelectionRange(str.length, str.length);
		setShowSuggestions(false);
	};

	return (
		<div className="bg-[#111111] flex w-full h-dvh">
			<Toaster />
			<Sidebar
				isSideBarVisible={isSideBarVisible}
				isMobile={checkMobileDevice}
				onClose={() => setSideBarVisible(!isSideBarVisible)}
				onDeleteChat={(chatId) => deleteChat(chatId)}
				chats={chats}
				userName={userName}
			/>
			<div className="flex flex-col flex-1 w-full overflow-hidden">
				<div className="w-full flex">
					{checkMobileDevice && (
						<div className="sticky left-0 top-0 bg-[#0a0a0a] active:border-none border-none focus-within:border-none h-15 flex justify-center items-center p-4">
							<button
								onClick={() => {
									setSideBarVisible(!isSideBarVisible);
								}}
								className="p-1.5 hover:bg-[#1f1f1f] rounded-md transition-colors duration-150 cursor-pointer"
								aria-label="Open sidebar"
							>
								<MenuIcon color="#a1a1aa" size={20} />
							</button>
						</div>
					)}
					<ChatPageHeader />
				</div>

				{/* Main Content - Chat Interface */}
				<div className="flex flex-col flex-1 min-h-0 relative ">
					<div className="flex-1 overflow-y-auto scroll-box p-4 sm:p-8">
						<div className="max-w-3xl mx-auto flex flex-col gap-8 py-4">
							{!promptMsg ? (
								!checkMobileDevice && <ChatGreeting />
							) : (
								<NewPromptContainer
									promptMsg={promptMsg}
									errorMsg={errorMsg}
								/>
							)}
						</div>
						<div ref={scrollToBottomRef}></div>
					</div>

					{/* Input Area */}
					<div className="w-full p-4 ">
						<div className="max-w-3xl mx-auto">
							{showSuggestions && (
								<div className="flex flex-col">
									<div className="pb-1 px-2 md:px-6">
										<p className="text-sm text-[#faf9fb]/60">
											Suggestions:
										</p>
									</div>
									<div className="flex flex-col md:flex-row gap-2.5 justify-center items-start md:items-center pt-2 pb-6 transition-all duration-300 ease-in-out">
										<div
											className="px-4 py-2.5 rounded-2xl border border-[#ffffff26] h-10 flex items-center justify-center text-[#f9fafb]/70 transition-colors hover:bg-[#414141]/50 cursor-pointer "
											onClick={() =>
												handleSuggestionClick(
													"Bouncing ball animation ",
												)
											}
										>
											Bouncing ball animation
										</div>
										<div
											className="px-4 py-2.5 rounded-2xl border border-[#ffffff26] h-10 flex items-center justify-center text-[#f9fafb]/70 transition-colors hover:bg-[#414141]/50 cursor-pointer "
											onClick={(e) =>
												handleSuggestionClick(
													"Shape shifting animation ",
												)
											}
										>
											Shape shifting animation
										</div>
										<div
											className="px-4 py-2.5 rounded-2xl border border-[#ffffff26] h-10 flex items-center justify-center text-[#f9fafb]/70 transition-colors hover:bg-[#414141]/50 cursor-pointer "
											onClick={() =>
												handleSuggestionClick(
													"Random animation ",
												)
											}
										>
											Random animation
										</div>
									</div>
								</div>
							)}
							<form
								className="relative flex flex-col bg-[#202020] border border-[#ffffff15] rounded-3xl overflow-hidden focus-within:border-[#488AED]/15 transition-colors"
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
								<div className="flex justify-between items-center px-4 pt-2 pb-3.5 bg-[#202020]">
									<div className="flex gap-2 text-gray-500">
										{/* Optional tools/buttons could go here */}
										<ResolutionSelectComponent
											setSelectedResolution={
												setSelectedResolution
											}
										/>
									</div>
									<Button
										variant="primary"
										size="icon"
										className="h-8 w-8 rounded-lg"
										children={
											<ArrowUp color="black" size={18} />
										}
									/>
								</div>
							</form>
							{!checkMobileDevice ? (
								<div className="pt-2 text-center w-full">
									<p className="text-xs text-[#ffffff80]">
										AnimFlow prefers short, focused prompts.
										Complex scenes or multi-concept prompts
										may fail as the model is still being
										improved.
									</p>
								</div>
							) : (
								<div></div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const NewPromptContainer = ({
	promptMsg,
	errorMsg,
}: {
	promptMsg: string;
	errorMsg: string | null;
}) => {
	return (
		<div className="flex flex-col gap-1 items-end">
			<div className="w-full">
				<div
					id={"temp"}
					className="px-4 py-6 w-full flex flex-col gap-2.5"
				>
					<div className="flex w-fit gap-1.5 self-end-safe flex-col bg-transparent msg-container">
						<div className="px-3.5 py-2 sm:px-4 sm:py-2.5 w-fit max-w-lg self-end-safe bg-[#202020] rounded-xl">
							<p className="text-base text-[#f5f5f5]/90">
								{promptMsg}
							</p>
						</div>
						<div className="hidden-buttons flex w-full justify-end pr-4">
							<div
								className="cursor-pointer text-white/70"
								onClick={async () => {
									await navigator.clipboard.writeText(
										promptMsg,
									);
									const copyMsg = () =>
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
									copyMsg();
								}}
							>
								<Copy size={18} />
							</div>
						</div>
					</div>
					<div className="px-2.5 py-1.5 w-full self-start bg-transparent border-none">
						{!errorMsg ? (
							<p className="text-base text-white/75">
								Processing...
							</p>
						) : (
							<p className="text-base text-white/75">
								{errorMsg}. Please try again later.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
