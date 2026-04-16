import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Plastic Folder (A4)', category: 'Offices Supplies', stock: 150, price: 50 },
    { id: 2, name: 'Clear Plastic Envelopes', category: 'Office Supplies', stock: 200, price: 50 },
    { id: 3, name: 'Plastic Binders', category: 'Office Supplies', stock: 120, price: 50 },
    { id: 4, name: 'Plastic Storage', category: 'Storage', stock: 80, price: 50 },
    { id: 5, name: 'Plastic Dividers', category: 'Offices Supplies', stock: 180, price: 50 },
    { id: 6, name: 'Document Organizer', category: 'Office Supplies', stock: 60, price: 50 },
    { id: 7, name: 'File Folders Set', category: 'Offices Supplies', stock: 90, price: 50 },
    { id: 8, name: 'Plastic Sleeves', category: 'Office Supplies', stock: 220, price: 50 },
  ]);

  // Function to get top 4 products with lowest stock (fast-moving)
  const getFastMovingProducts = () => {
    return [...products]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4);
  };

  // Function to add/update product
  const updateProduct = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  // Function to delete product
  const deleteProduct = (productId) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  };

  // Function to add new product
  const addProduct = (newProduct) => {
    const maxId = Math.max(...products.map(p => p.id), 0);
    setProducts([{ ...newProduct, id: maxId + 1 } , ...products,]);
  };

  const value = {
    products,
    setProducts,
    getFastMovingProducts,
    updateProduct,
    deleteProduct,
    addProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};