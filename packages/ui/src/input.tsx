import React, { InputHTMLAttributes, forwardRef, Ref, RefObject } from 'react';

interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
}

type InputSizeTypes = {
    sm: string;
    md: string;
    lg: string;
    full: string;
}

const inputSize: InputSizeTypes = {
    'sm': ' px-1 py-0.5 ',
    'md': ' px-1.5 py-1 ',
    'lg': ' px-2 py-1 ',
    'full': ' px-3 py-1 w-full '
}

// Use forwardRef to accept and pass the ref
const Input = forwardRef<HTMLInputElement, InputBoxProps>(
  (props, ref: Ref<HTMLInputElement>) => {
    // You can apply consistent styling here
    const baseClasses = `bg-transparent px-1.5 py-0.5 border border-white/20 rounded-md h-9 placeholder:text-[#ffffff60]  focus-visible:outline-none text-base md:text-sm  disabled:cursor-not-allowed disabled:border-[#40403f] disabled:opacity-50 hover:border-[#d8d6cf]/20 transition-colors duration-150 ease-in-out `;

    return (
      <input
        // Pass the ref to the actual DOM element
        ref={ref}
        className={baseClasses}
        // {...props} // Spread other standard input props like type, value, onChange
        id={props.id}
        placeholder={props.placeholder} 
        type={props.type}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete={props.autoComplete}
      />
    );
  }
);

// Add a display name for better debugging in React DevTools




interface InputProps {
    id: string;
    type: string;
    placeholder: string;
    // size: 'sm' | 'md' | 'lg' | 'full';
    autoComplete?: string;
    ref?: RefObject<HTMLInputElement | null>;
}



const InputBox = ({ id, type, placeholder, autoComplete, ref }: InputProps) => {
    return (
        <input 
            id={id}
            className={`bg-transparent border border-white/20 rounded-md h-9 placeholder:text-[#ffffff60]  focus-visible:outline-none text-base md:text-sm px-3 py-1 w-full disabled:cursor-not-allowed disabled:border-[#40403f] disabled:opacity-50 hover:border-[#d8d6cf]/20 transition-colors duration-150 ease-in-out `}
            placeholder={placeholder} 
            type={type}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete={autoComplete}
            ref={ref}
        />
    )
}

export default InputBox;