export const ChatGreeting = () => {
	return (
		<div className="flex flex-col items-center justify-center h-40 text-center text-gray-400 mt-20">
			<div
				key={"greeting"}
				className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4"
			>
				<span className="text-2xl">✨</span>
			</div>
			<h2 className="text-xl font-medium text-white mb-2">
				How can I help you create an animation today?
			</h2>
		</div>
	);
};
