import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';

const MenuItem = ({ item }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-6xl">🍽️</div>`;
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <span className="text-orange-600 font-bold text-lg ml-2 shrink-0">
            {formatPrice(item.price)}
          </span>
        </div>

        <span className="w-fit inline-block text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 mb-2">
          {item.category}
        </span>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>

        {quantity === 0 ? (
          <button
            onClick={() => addItem(item)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="w-10 h-10 rounded-lg bg-white shadow-sm text-orange-600 font-bold text-lg hover:bg-orange-100 transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="font-semibold text-orange-700 text-lg">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="w-10 h-10 rounded-lg bg-white shadow-sm text-orange-600 font-bold text-lg hover:bg-orange-100 transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
