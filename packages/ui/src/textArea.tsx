import { RefObject } from "react"

interface TextAreaProps {
    ref: RefObject<HTMLTextAreaElement | null>
}

export const TextAreaComp = ({ ref }: TextAreaProps) => {
    return (
        <textarea className="w-full border-none rounded-md p-2 resize-none max-h-[max(35svh, 5rem)] focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none leading-snug scroll-auto flex-1 text-sm sm:text-base lg:text-lg scroll-bar" placeholder="Enter a prompt for your video..." maxLength={50000} id="promptField" ref={ ref }>

        </textarea>
    )
}