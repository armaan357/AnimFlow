"use client"
import { useEffect, useRef } from "react"
import { Button } from "./button";
import { ArrowUp } from "lucide-react";

export const HeroSection= () => {

    const inpRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        inpRef.current = document.querySelector("#promptField");
        if(!inpRef.current)     return;

        inpRef.current.addEventListener('input', autoResize, false)
        function autoResize() {
            // this.style.height = 'auto';
            if(!inpRef.current)     return;
            inpRef.current.style.height = 'auto';
            inpRef.current.style.height = inpRef.current.scrollHeight + 'px';
        }
    }, []);

    return (
        <main className="min-h-dvh flex flex-col justify-center items-center bg-[#121212]">
            <div className="flex flex-col items-center justify-center px-4 mb-4 md:mb-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">
                    What will you animate today?
                </h1>
                <h2 className="mb-6 text-center text-lg md:text-xl max-w-[25ch] md:max-w-full font-medium text-[#ffffff80]">
                    Create 2D animations by chatting with AI
                </h2>             
            </div>
            <div className="flex flex-col px-3 py-2 border border-[#ffffff15] rounded-xl w-[85dvw] sm:w-[80dvw] max-w-3xl lg:w-full bg-[#181818]">
                <div className="w-full flex">
                    <textarea className="w-full border-none rounded-md p-2 resize-none max-h-[max(35svh, 5rem)] focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none leading-snug scroll-auto flex-1" placeholder="Enter a prompt for your video..." maxLength={50000} id="promptField">

                    </textarea>
                </div>
                <div className="w-full flex items-center justify-between py-2">
                    <div></div>
                    <div>
                        <Button
                            variant="primary"
                            size="icon"
                            children={<ArrowUp color="black" size={25} />}
                            onClick={() => {alert('prompt sent')}}
                        />
                    </div>
                    
                </div>
            </div>
        </main>
    )
}