"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onVisibilityChange?: (visible: boolean) => void;
};

export function PasswordInput({
  className,
  onVisibilityChange,
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible((current) => {
      const next = !current;
      onVisibilityChange?.(next);
      return next;
    });
  };

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={visible ? "text" : "password"}
        onFocus={(event) => {
          onFocus?.(event);
        }}
        onBlur={(event) => {
          onBlur?.(event);
        }}
        className={`${className ?? "input-field"} w-full !pr-11`}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleVisibility();
        }}
        className="absolute top-1/2 end-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        {visible ? <EyeOff className="h-5 w-5 pointer-events-none" /> : <Eye className="h-5 w-5 pointer-events-none" />}
      </button>
    </div>
  );
}
