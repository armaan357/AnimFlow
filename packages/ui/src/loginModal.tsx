"use client";

import { useState } from "react";
import { Button } from "./button";
import { Modal } from "./modal";
import { AnimFlowLogo } from "../assets/AnimFlowLogo";

export const LoginButtonAndModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="hidden sm:flex">
			<Button
				children={"Login"}
				variant="secondary"
				size="md"
				onClick={() => {
					setIsOpen(true);
				}}
			/>
			<Modal
				isOpen={isOpen}
				children={<ModalHeader />}
				onClose={() => setIsOpen(false)}
			/>
		</div>
	);
};

const ModalHeader = () => {
	return (
		<div>
			<div className="w-full pt-5 pb-10">
				<div className="w-auto flex justify-start">
					<AnimFlowLogo />
				</div>
				<div className="text-2xl font-bold text-[#ffffff80]">
					Log in to your account
				</div>
			</div>
			<div className="w-full flex flex-col gap-4 justify-center items-center">
				<div className="w-full">
					<Button
						variant="secondary"
						children={"Continue With Google"}
						size="full"
						onClick={() =>
							alert("Continue with Google will be triggered")
						}
					/>
				</div>
				<div className="w-full">
					<Button
						variant="secondary"
						children={"Continue With GitHub"}
						size="full"
						onClick={() =>
							alert("Continue with GitHub will be triggered")
						}
					/>
				</div>
				<div className="relative w-full">
					<div className="absolute flex items-center inset-0 w-full">
						<span className="w-full border-t border-[#ffffff15]" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="px-2 bg-[#1a1a1a] text-[#ffffff85]">
							Or
						</span>
					</div>
				</div>
				<div className="w-full">
					<Button
						variant="primary"
						children={"Continue with email and password"}
						size="full"
						onClick={() =>
							alert(
								"Login with email and password will be triggered",
							)
						}
					/>
				</div>
			</div>
		</div>
	);
};
