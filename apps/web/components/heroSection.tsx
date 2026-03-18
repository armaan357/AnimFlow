"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/button";
import { ArrowUp } from "lucide-react";
import { TextAreaComp } from "@repo/ui/textArea";
import { Modal } from "@repo/ui/modal";
import Link from "next/link";
import { BackgroundBeams } from "@repo/ui/components/ui/background-beams";

export const HeroSection = () => {
	const inpRef = useRef<HTMLTextAreaElement | null>(null);
	const [isModalOpen, setModalOpen] = useState<boolean>(false);

	useEffect(() => {
		if (!inpRef.current) {
			console.log("input ref not found");
			return;
		}

		inpRef.current.addEventListener("input", autoResize, false);
		function autoResize() {
			// this.style.height = 'auto';
			console.log("auto resizing...");
			if (!inpRef.current) return;
			inpRef.current.style.height = "auto";
			inpRef.current.style.height = inpRef.current.scrollHeight + "px";
		}
	}, []);

	return (
		<main className="min-h-dvh flex flex-col z-100 justify-center items-center bg-[#121212]">
			<BackgroundBeams />
			<div className="flex flex-col items-center justify-center px-4 mb-4 md:mb-6 gap-5">
				<h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">
					What will you animate today?
				</h1>
				<h2 className="mb-6 text-center text-lg md:text-xl max-w-[25ch] md:max-w-full font-medium text-[#ffffff80]">
					Create 2D animations by chatting with AI
				</h2>
			</div>
			<div className="w-full p-4 bg-transparent z-110 ">
				<div className="max-w-3xl mx-auto z-115 ">
					<form
						className="relative flex flex-col bg-[#181818] border border-[#ffffff15] rounded-xl overflow-hidden focus-within:border-[#488AED]/15 transition-colors z-120 "
						onSubmit={(e) => {
							e.preventDefault();
							if (inpRef.current && inpRef.current.value.trim()) {
								setModalOpen(true);
								inpRef.current.value = "";
							}
						}}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								if (!e.shiftKey) {
									e.preventDefault();
									setModalOpen(true);
								}
							}
						}}
					>
						<div className="p-2 z-121 ">
							<TextAreaComp
								ref={inpRef}
								placeholder="Describe your animation..."
								className="min-h-15 bg-transparent resize-none z-122 "
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
								children={<ArrowUp color="black" size={18} />}
							/>
						</div>
					</form>
				</div>
			</div>
			<Modal
				isOpen={isModalOpen}
				children={<ModalContent />}
				onClose={() => setModalOpen(false)}
			/>
		</main>
	);
};

const ModalContent = () => {
	return (
		<div>
			<div className="w-full pt-7 pb-8 flex flex-col gap-3">
				<div className="w-auto flex justify-start">
					<div className="w-fit">
						<span className="font-bold text-3xl text-[#e3e3e3]">
							AnimFlow
						</span>
					</div>
				</div>
				<div className="text-lg text-[#ffffff80]">
					To use AnimFlow, create a new account or log into an
					existing one.
				</div>
			</div>
			<div className="w-full flex flex-col gap-4 justify-center items-center">
				<div className="w-full">
					<Link href={"/signup"}>
						<Button
							variant="primary"
							children={"Sign Up"}
							size="full"
						/>
					</Link>
				</div>
				<div className="w-full">
					<Link href={"/signin"}>
						<Button
							variant="secondary"
							children={"Sign In"}
							size="full"
						/>
					</Link>
				</div>
			</div>
		</div>
	);
};
