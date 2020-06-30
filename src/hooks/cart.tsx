import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const newProducts = await AsyncStorage.getItem('@goMarket:Products');
      setProducts(JSON.parse(newProducts));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(produto =>
          produto.id === id
            ? { ...produto, quantity: produto.quantity + 1 }
            : produto,
        ),
      );
      await AsyncStorage.setItem(
        '@goMarket:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const product = products.find(produto => produto.id === id);
      if (product?.quantity === 1) {
        // console.log('to aqui');
        const newProducts = products.filter(
          produto => produto.id !== product.id,
        );
        setProducts(newProducts);
      } else {
        // console.log('na real to aqui');
        setProducts(
          products.map(produto =>
            produto.id === id
              ? { ...produto, quantity: produto.quantity - 1 }
              : produto,
          ),
        );
      }
      await AsyncStorage.setItem(
        '@goMarket:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(
        produto => produto.id === product.id,
      );
      if (productIndex !== -1) {
        increment(products[productIndex].id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@goMarket:Products',
        JSON.stringify(products),
      );
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
