function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 disabled:bg-slate-100"
      />
    </label>
  );
}

export default FormInput;
