'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Option {
  value: string;
  label: string;
}

export default function OtherInline({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  className = '',
  hideOtherInput = false,
  disabled = false, // ✅ added prop
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  hideOtherInput?: boolean;
  disabled?: boolean; // ✅ added prop type
}) {
  const isOtherSelected = value === 'Other';
  const isCustomValue = value && !options.some((o) => o.value === value);

  // show input if “Other” selected or it’s a custom typed value
  const showInput = !hideOtherInput && (isOtherSelected || isCustomValue);

  return (
    <div className={`flex flex-col ${className}`}>
      <Label className="block mb-1">{label}</Label>

      {showInput ? (
        <Input
          className="h-10"
          placeholder="Type here..."
          value={isOtherSelected ? '' : value}
          onChange={(e) => !disabled && onChange(e.target.value)} // ✅ prevent typing if disabled
          onBlur={(e) => {
            if (!e.target.value.trim()) onChange('');
          }}
          disabled={disabled} // ✅ disable input
        />
      ) : (
        <select
          className="w-full border rounded-lg h-10 px-3 bg-background disabled:opacity-60"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled} // ✅ disable select
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
