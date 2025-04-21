import React, { useCallback } from "react";
import { isAddress } from "viem";

type IntegerInputProps = {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  disableMultiplyBy1e18?: boolean;
};

/**
 * IntegerInput component for entering token amounts
 */
export const IntegerInput: React.FC<IntegerInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  className = "",
  name,
  disableMultiplyBy1e18 = false,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Check if the value is a valid integer (allowing empty string)
      if (value === "" || /^[0-9]+$/.test(value)) {
        onChange(value);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1 relative">
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        className={`input input-bordered focus:input-primary ${className}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
      />
      {!disableMultiplyBy1e18 && !isAddress(value) && Number(value) > 0 && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1.5 items-center bg-base-200 rounded-lg px-2 py-1">
          <span className="text-sm">× 10^18</span>
        </div>
      )}
    </div>
  );
};
