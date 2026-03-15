import { Header } from "../../../components/header";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="bg-[#121212] flex w-full h-dvh">
			<Header />
			<div className="flex ">
				<Skeleton />
			</div>
		</div>
	);
}
