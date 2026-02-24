const FormField = ({ label, name, type = 'text', value, onChange, onBlur, error, placeholder }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
          }`}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
