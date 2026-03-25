"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Modal } from "@repo/ui/modal";
import Link from "next/link";

export const SignUpButtonAndModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="flex">
			<Button
				children={"Sign Up"}
				variant="primary"
				size="md"
				onClick={() => {
					setIsOpen(true);
				}}
			/>
			<Modal
				isOpen={isOpen}
				children={<SignUpModalContent />}
				onClose={() => setIsOpen(false)}
			/>
		</div>
	);
};

const SignUpModalContent = () => {
	return (
		<div>
			<div className="w-full pt-5 pb-10">
				<div className="w-auto flex justify-start">
					<div className="w-fit">
						<span className="font-bold text-2xl text-[#e3e3e3]">
							AnimFlow
						</span>
					</div>
				</div>
				<div className="text-2xl font-bold text-[#ffffff80]">
					Create Your Account
				</div>
			</div>
			<div className="w-full flex flex-col gap-4 justify-center items-center">
				<div className="w-full">
					<Button
						variant="secondary"
						children={"Continue With Google"}
						size="full"
						onClick={() => {
							try {
								window.location.href = `/api/backend/user/auth/google`;
							} catch (e: any) {
								console.log("error = ", e.toString());
							}
						}}
					/>
				</div>
				<div className="w-full">
					<Button
						variant="secondary"
						children={"Continue With GitHub"}
						size="full"
						onClick={() => {
							try {
								window.location.href = `/api/backend/user/auth/github`;
							} catch (e: any) {
								console.log("error = ", e.toString());
							}
						}}
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
					<Link href={"/signup"}>
						<Button
							variant="primary"
							children={"Continue with email and password"}
							size="full"
						/>
					</Link>
				</div>
			</div>
		</div>
	);
};
