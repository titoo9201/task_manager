const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    member: 'bg-indigo-100 text-indigo-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant] || variants.default} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;