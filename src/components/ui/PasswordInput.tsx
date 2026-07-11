"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onVisibilityChange?: (visible: boolean) => void;
};

export function PasswordInput({ className, onVisibilityChange, onFocus, onBlur, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible((v) => {
      const next = !v;
      onVisibilityChange?.(next);
      return next;
    });
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        onFocus={(e) => {
          onFocus?.(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
        }}
        className={`${className ?? "input-field"} pe-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={toggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 end-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
