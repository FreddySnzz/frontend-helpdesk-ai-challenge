"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  id,
  placeholder,
  autoComplete,
  value,
  onChange,
  required,
  disabled,
  className,
}: {
  id: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        required={required}
        disabled={disabled}
      />

      <button
        type="button"
        aria-label="Visualizar senha"
        title="Visualizar senha"
        onClick={() => setShowPassword((v) => !v)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
          text-muted-foreground dark:text-zinc-400 hover:text-foreground transition-colors
        `}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
