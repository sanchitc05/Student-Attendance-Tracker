function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
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
        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition disabled:bg-slate-100 ${
          error
            ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-200'
        }`}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export default FormInput;
