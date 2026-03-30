import { Button } from "@repo/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

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

export const VersionSideBar = ({
	isVersionTabVisible,
	onClose,
	messages,
	setMessageToDisplay,
	messageToDisplay,
	checkMobileDevice,
}: {
	isVersionTabVisible: boolean;
	onClose: () => void;
	messages: MessageType[] | null;
	setMessageToDisplay: Dispatch<SetStateAction<MessageType | null>>;
	messageToDisplay: MessageType | null;
	checkMobileDevice: boolean;
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
			className={`max-h-full h-fit absolute top-0 ${checkMobileDevice ? " left-4 rounded-bl-lg " : " left-0 rounded-tr-lg "} z-30 transition-transform duration-200 ease-in-out  rounded-br-lg ${isVersionTabVisible && " pb-1.5  shadow-2xl "} flex flex-col w-54 bg-[#202020] border border-white/2`}
		>
			<div className="flex flex-row justify-between items-center p-2 transition-transform duration-200 ease-in-out">
				<div
					className={`flex items-center w-full px-3 py-0.5 transition-transform duration-200 ease-in-out`}
				>
					{!isVersionTabVisible ? (
						<>
							{messageToDisplay?.versionNo && (
								<div className="flex justify-center items-center font-medium">
									<p className="text-base text-white/80 tracking-widest cursor-default">
										v{messageToDisplay?.versionNo}
									</p>
								</div>
							)}
						</>
					) : (
						<div className="flex justify-center items-center font-medium">
							<p className="text-base text-white/50 tracking-wide">
								VERSIONS
							</p>
						</div>
					)}
				</div>
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
									<div
										className={`flex gap-5 items-center z-100 w-full pt-3 px-1 pb-9 ${messageToDisplay && messageToDisplay.id === m.id ? "bg-[#ffffff07] border-r-2 border-[#488AED]/50 " : " bg-transparent "}  hover:bg-[#272727] rounded-sm cursor-pointer relative`}
									>
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
