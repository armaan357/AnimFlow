"use client";
import { Button } from "@repo/ui/button";
import InputBox from "@repo/ui/input";
import axios from "axios";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/signUpPasswordInput";

const checkEmailExists = async (
	emailRef: RefObject<HTMLInputElement | null>,
	setPasswordInputVisible: Dispatch<SetStateAction<boolean>>,
	setErrorMsgVisible: Dispatch<SetStateAction<boolean>>,
	setErrorMsg: Dispatch<SetStateAction<string | null>>,
) => {
	if (!emailRef.current || emailRef.current.value === "") {
		return;
	}

	try {
		const resp = await axios.get(
			`/api/backend/user/email-exists?email=${emailRef.current.value!}`,
		);
		if (!resp) {
			return;
		}
		if (resp.data.exists) {
			if (resp.data.code && resp.data.code == 1) {
				setErrorMsg(resp.data.error);
			}
			setErrorMsgVisible(true);
		} else {
			setPasswordInputVisible(true);
			console.log(resp.data.error);
		}
	} catch (e: any) {
		return;
	}
};

const loginWithGoogle = async () => {
	try {
		window.location.href = `/api/backend/user/auth/google`;
	} catch (e: any) {
		console.log("error = ", e.toString());
	}
};

export default function SignUp() {
	const [isPasswordInputVisible, setPasswordInputVisible] =
		useState<boolean>(false);
	const [isErrorMsgVisible, setErrorMsgVisible] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [password, setPassword] = useState<string | null>(null);
	const [isPasswordValid, setPasswordValid] = useState<boolean>(false);

	const emailRef = useRef<HTMLInputElement | null>(null);
	const userNameRef = useRef<HTMLInputElement | null>(null);
	const navigate = useRouter();

	const signup = async () => {
		if (!password) return;
		const userInfo: {
			email: string;
			password: string;
			userName: string;
		} = {
			email: emailRef.current?.value!,
			userName: userNameRef.current?.value!,
			password: password,
		};
		try {
			if (
				userInfo.email.length === 0 ||
				userInfo.password.length === 0 ||
				userInfo.userName.length === 0
			)
				return;
			const signupResp = await axios.post(
				`/api/backend/user/signup`,
				userInfo,
				{ withCredentials: true },
			);
			if (!signupResp) return;
			if (signupResp.data.code) {
				if (signupResp.data.code == 1) {
					setErrorMsg(signupResp.data.error);
				}
				setErrorMsgVisible(true);
				return;
			}
			navigate.push("/chat/new");
		} catch (e: any) {
			console.log("error = ", e);
		}
	};

	const handlePasswordChange = (password: string) => {
		setPassword(password);
		// setPasswordValid(true);
	};

	return (
		<div className="justify-center h-full w-full min-h-screen bg-black pb-7.5">
			<div className="h-15 w-full flex justify-between items-center px-3 sm:px-8 md:px-12 ">
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
						children={"Log In"}
						onClick={() => navigate.push("/signin")}
					/>
				</div>
			</div>
			<div className="flex mx-auto justify-center items-center px-4 pt-20">
				<div className="relative flex flex-col justify-center max-w-87 w-87 sm:max-w-4xl sm:w-92 md:w-97.5">
					<div className="w-full pt-5 pb-10">
						<div className="w-auto flex justify-start"></div>
						<div className="text-2xl font-bold text-center text-[#ffffff80]">
							Create Your Account
						</div>
					</div>
					<div className="w-full flex flex-col gap-4 justify-center text-center items-center">
						<div className="w-full">
							<Button
								variant="secondary"
								children={"Continue With Google"}
								size="full"
								onClick={() => {
									loginWithGoogle();
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
								<span className="w-full border-t border-[#ffffff25]" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="px-2 bg-black text-[#ffffff85]">
									Or
								</span>
							</div>
						</div>
						<div className="flex flex-col text-center gap-4 w-full pb-5">
							<InputBox
								id="email"
								placeholder="Email"
								autoComplete="off"
								type="email"
								ref={emailRef}
							/>
							{isPasswordInputVisible && (
								<div className="flex flex-col gap-4 w-full">
									<InputBox
										id="userName"
										placeholder="Enter your name"
										type="text"
										ref={userNameRef}
									/>
									<PasswordInput
										id="pwd"
										onChange={(
											value: string,
											isValid: boolean,
										) => {
											setPasswordValid(isValid);
											if (isValid) {
												handlePasswordChange(value);
											}
										}}
										placeholder="Password"
									/>
								</div>
							)}
							{isErrorMsgVisible && (
								<>
									{errorMsg ? (
										<p className="text-white/80 text-base">
											{errorMsg}
										</p>
									) : (
										<p>
											Account already exists. Please{" "}
											<Link
												href={"/signin"}
												className="text-blue-300 transition-all duration-150 ease-in-out hover:text-blue-500 hover:underline cursor-pointer"
											>
												login
											</Link>{" "}
											to your account.
										</p>
									)}
								</>
							)}
							<div className="w-full h-0"></div>
							<Button
								variant="primary"
								children={"Continue"}
								size="full"
								disabled={
									isErrorMsgVisible ||
									(isPasswordInputVisible && !isPasswordValid)
										? true
										: false
								}
								onClick={() => {
									if (
										isPasswordInputVisible &&
										!isErrorMsgVisible &&
										isPasswordValid
									)
										signup();
									else
										checkEmailExists(
											emailRef,
											setPasswordInputVisible,
											setErrorMsgVisible,
											setErrorMsg,
										);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
