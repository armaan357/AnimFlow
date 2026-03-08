"use client";
import { ArrowUp } from "lucide-react";
import { Button } from "./button";
import { TextAreaComp } from "./textArea";
import { useRef } from "react";

export const ChatPageForm = () => {
	const inpRef = useRef<HTMLTextAreaElement>(null);
	return (
		<div className="w-full p-4 bg-[#121212] ">
			<div className="max-w-3xl mx-auto">
				<form
					className="relative flex flex-col bg-[#181818] border border-[#ffffff15] rounded-xl overflow-hidden focus-within:border-[#ffffff30] transition-colors"
					onSubmit={(e) => {
						e.preventDefault();
						if (inpRef.current && inpRef.current.value.trim()) {
							alert(`Prompt sent: ${inpRef.current.value}`);
							inpRef.current.value = "";
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
							children={<ArrowUp color="black" size={18} />}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};
