import React from "react";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
  options?: Option[];
  id?: string;
}

export default function FormField({ 
  name, 
  label, 
  placeholder = "", 
  required = false, 
  type = "text",
  textarea = false,
  rows = 3,
  options,
  id
}: FormFieldProps) {
  const fieldId = id || `field-${name}`;
  
  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 min-h-[100px]"
        />
      ) : options ? (
        <div className="relative">
          <select
            id={fieldId}
            name={name}
            required={required}
            className="appearance-none w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all cursor-pointer"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
        />
      )}
    </div>
  );
}