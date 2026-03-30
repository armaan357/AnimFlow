import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/@workspace/ui/components/select";
import { Dispatch, SetStateAction } from "react";

export const ResolutionSelectComponent = ({
	setSelectedResolution,
}: {
	setSelectedResolution: Dispatch<SetStateAction<string>>;
}) => {
	return (
		<Select
			defaultValue="l"
			onValueChange={(s) => setSelectedResolution(s)}
		>
			<SelectTrigger className="w-40 sm:w-45 text-[#f5f5f5] border-white/5 bg-[#262626]">
				<SelectValue
					className="text-[#f5f5f5]"
					placeholder="Select video resolution"
				/>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup className="text-[#ffffff85] border border-white/5 bg-[#262626]">
					<SelectLabel className="">Quality</SelectLabel>
					<SelectItem
						className="hover:bg-[#343434] text-[#d2d2d2] hover:text-white transition-colors duration-200"
						value="l"
					>
						480p15
					</SelectItem>
					<SelectItem
						className="hover:bg-[#343434] text-[#d2d2d2] hover:text-white transition-colors duration-200"
						value="m"
					>
						720p30
					</SelectItem>
					<SelectItem
						className="hover:bg-[#343434] text-[#d2d2d2] hover:text-white transition-colors duration-200"
						value="h"
					>
						1080p60
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
