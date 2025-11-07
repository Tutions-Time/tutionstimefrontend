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
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const isOtherSelected = value === 'Other';
  const isCustomValue = value && !options.some(o => o.value === value);

  // show input if “Other” selected or it’s a custom typed value
  const showInput = isOtherSelected || isCustomValue;

  return (
    <div className={`flex flex-col ${className}`}>
      <Label className="block mb-1">{label}</Label>

      {showInput ? (
        <Input
          className="h-10"
          placeholder="Type here..."
          value={isOtherSelected ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            if (!e.target.value.trim()) onChange('');
          }}
        />
      ) : (
        <select
          className="w-full border rounded-lg h-10 px-3 bg-background"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
