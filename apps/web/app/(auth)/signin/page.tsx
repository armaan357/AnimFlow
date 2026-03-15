"use client";
import { Button } from "@repo/ui/button";
import InputBox, { PasswordInputBox } from "@repo/ui/input";
import axios from "axios";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const checkEmailExists = async (
	emailRef: RefObject<HTMLInputElement | null>,
	setPasswordInputVisible: Dispatch<SetStateAction<boolean>>,
	setErrorMsgVisible: Dispatch<SetStateAction<boolean>>,
) => {
	if (!backendUrl) {
		console.log("Backend URL not found");
		return;
	}
	if (!emailRef.current || emailRef.current.value === "") {
		return;
	}

	try {
		const resp = await axios.get(
			`${backendUrl}user/email-exists?email=${emailRef.current.value!}`,
		);
		if (!resp) {
			console.log("No response from server");
			return;
		}

		if (resp.data.exists) {
			setPasswordInputVisible(true);
		} else {
			setErrorMsgVisible(true);
		}
	} catch (e: any) {
		console.log("error = ", e.toString());
	}
};

export default function Signin() {
	const [isPasswordInputVisible, setPasswordInputVisible] =
		useState<boolean>(false);
	const [isErrorMsgVisible, setErrorMsgVisible] = useState<boolean>(false);
	const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const passwordRef = useRef<HTMLInputElement | null>(null);
	const navigate = useRouter();

	const signin = async () => {
		const userInfo: { email: string; password: string } = {
			email: emailRef.current?.value!,
			password: passwordRef.current?.value!,
		};
		try {
			if (userInfo.email.length === 0 || userInfo.password.length === 0)
				return;
			const signinResp = await axios.post(
				`${backendUrl}user/signin`,
				userInfo,
				{ withCredentials: true },
			);
			if (!signinResp) return;
			console.log("signin resp = ", signinResp);
			navigate.push("/chat/new");
		} catch (e: any) {
			console.log("error = ", e);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center h-full w-full min-h-screen overflow-hidden bg-black">
			<div className="h-15 absolute top-0 w-full flex justify-between items-center px-3 sm:px-8 md:px-12">
				<div>
					<Link href={"/"} className="cursor-pointer">
						<div className="w-fit cursor-pointer">
							<span className="font-semibold text-xl text-[#e3e3e3]">
								Anim
								<span className="text-[#488AED]/75">Flow</span>
							</span>
						</div>
					</Link>
				</div>
				<div>
					<Button
						variant="secondary"
						size="md"
						children={"Sign Up"}
						onClick={() => navigate.push("/signup")}
					/>
				</div>
			</div>
			<div className="flex justify-center items-center px-4">
				<div className="relative flex flex-col justify-center max-w-87 w-87 sm:max-w-4xl sm:w-92 md:w-97.5">
					<div className="w-full pt-5 pb-10">
						<div className="w-auto flex justify-center">
							{/* <div className="w-fit">
								<span className="font-bold text-2xl text-[#e3e3e3]">
									AnimFlow
								</span>
							</div> */}
						</div>
						<div className="text-2xl text-center font-bold text-[#ffffff80]">
							Log in to your account
						</div>
					</div>
					<div className="w-full flex flex-col gap-4 px-7 sm:px-3 md:px-0.5 justify-center items-center">
						<div className="w-full">
							<Button
								variant="secondary"
								children={"Continue With Google"}
								size="full"
								onClick={() =>
									alert(
										"Continue with Google will be triggered",
									)
								}
							/>
						</div>
						<div className="w-full">
							<Button
								variant="secondary"
								children={"Continue With GitHub"}
								size="full"
								onClick={() =>
									alert(
										"Continue with GitHub will be triggered",
									)
								}
							/>
						</div>
						<div className="relative w-full">
							<div className="absolute flex items-center inset-0 w-full">
								<span className="w-full border-t border-[#ffffff25]" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="px-2 bg-black text-[#ffffff85]">
									Or
								</span>
							</div>
						</div>
						<div className="flex flex-col justify-center text-center gap-3 w-full">
							<InputBox
								id="email"
								placeholder="Email"
								autoComplete="off"
								type="email"
								ref={emailRef}
							/>
							{isPasswordInputVisible && (
								<PasswordInputBox
									id="pwd"
									placeholder="Password"
									ref={passwordRef}
									isPasswordVisible={isPasswordVisible}
									setPasswordVisible={() =>
										setPasswordVisible(!isPasswordVisible)
									}
								/>
							)}
							{isErrorMsgVisible && (
								<p className="text-white/80 text-base">
									Account does not exist. Please{" "}
									<Link
										href={"/signup"}
										className="text-blue-300 transition-all duration-150 ease-in-out hover:text-blue-500 hover:underline cursor-pointer"
									>
										create
									</Link>{" "}
									a new account.
								</p>
							)}
							<Button
								variant="primary"
								children={"Continue"}
								size="full"
								disabled={isErrorMsgVisible ? true : false}
								onClick={() => {
									if (
										isPasswordInputVisible &&
										!isErrorMsgVisible
									)
										signin();
									else
										checkEmailExists(
											emailRef,
											setPasswordInputVisible,
											setErrorMsgVisible,
										);
								}}
							/>
							{/* <div
								className={`flex justify-center text-center mt-4 ${isErrorMsgVisible ? " invisible " : ""}`}
							>
								<p className="text-white/80 text-base ">
									Don't have an account?{" "}
									<Link
										href={"/signin"}
										className={`text-blue-300 transition-all duration-150 ease-in-out hover:text-blue-500 hover:underline cursor-pointer`}
									>
										Sign Up
									</Link>{" "}
								</p>
							</div> */}
						</div>
					</div>
				</div>
			</div>
			{/* <div className="sticky top-0 hidden lg:block h-screen rounded-xl p-4">
				<div className="bg-black w-full h-full rounded-lg flex justify-center items-center">
					<p className="text-4xl text-[#ffffff80] font-bold">
						A Play button logo will appear here!
					</p>
				</div>
			</div> */}
		</div>
	);
}
