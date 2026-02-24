import MenuItem from './MenuItem';

const MenuItemSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-20" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  </div>
);

const MenuList = ({ items, loading, error }) => {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No menu items available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default MenuList;
