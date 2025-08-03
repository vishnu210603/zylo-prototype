import React from "react";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
}

export default function FormField({ 
  name, 
  label, 
  placeholder, 
  required = false, 
  type = "text",
  textarea = false,
  rows = 3
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  
  return (
    <label htmlFor={fieldId} className="block">
      <span className="block mb-2 font-medium text-foreground">{label}</span>
      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all min-h-[100px]"
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
        />
      )}
    </label>
  );
}