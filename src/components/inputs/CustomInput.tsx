import { cn } from "@/lib/utils";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  searchbarPlaceholder?: string;
  type?: string;
  value?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  clearButtonAction?: () => void;
  withClearButton?: boolean;
  PasswordMode?: boolean;
  disabled?: boolean;
  max?: number;
  className?: string;
};

export function CustomInput({ 
  searchbarPlaceholder,
  type = "text",
  onChange,
  onFocus,
  onKeyDown,
  clearButtonAction,
  value,
  inputRef,
  withClearButton,
  PasswordMode,
  disabled,
  max,
  className,
  ...props
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(PasswordMode);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="relative w-full">
      <input
        type={`${showPassword ? 'password' : type}`}
        ref={inputRef}
        placeholder={searchbarPlaceholder}
        value={value}
        onFocus={onFocus}
        onChange={onChange}
        className={cn(
          withClearButton ? "pr-8" : "pr-3",
          "w-full pl-3 py-2 text-sm font-medium text-secondary",
          "bg-background-alternative-v2 rounded-lg ring-0",
          "dark:bg-input/30 dark:text-zinc-200",
          "focus:outline-none transition-all truncate", className
        )}
        maxLength={max}
        onKeyDown={onKeyDown}
        disabled={disabled}
        {...props}
      />

      {withClearButton && value && value.length > 0 && (
        <button
          type="button"
          aria-label="Limpar pesquisa"
          title="Limpar pesquisa"
          className={`absolute right-1.5 translate-y-1/4 cursor-pointer 
            ${disabled && withClearButton ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={clearButtonAction}
          disabled={disabled}
        >
          <X className="w-6 h-6 text-secondary cursor-pointer" />
        </button>
      )}
      
      {PasswordMode && (
        <button
          type="button"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-secondary
            cursor-pointer transition-colors ${disabled && PasswordMode ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={toggleShowPassword}
          disabled={disabled}
        >
          {showPassword ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};