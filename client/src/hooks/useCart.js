import { useCartContext } from '../context/CartContext';

export const useCart = () => {
  const { items, totalAmount, itemCount, dispatch } = useCartContext();

  const addItem = (menuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: menuItem });
  };

  const removeItem = (menuItemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });
  };

  const updateQuantity = (menuItemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (menuItemId) => {
    const item = items.find((i) => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  return {
    items,
    totalAmount,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };
};
