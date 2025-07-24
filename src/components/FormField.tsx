import React from "react";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}

export default function FormField({ name, label, placeholder, required = false, type = "text" }: FormFieldProps) {
  const fieldId = `field-${name}`;
  
  return (
    <label htmlFor={fieldId} className="block">
      <span className="block mb-1 font-medium text-foreground">{label}</span>
      <input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
      />
    </label>
  );
}