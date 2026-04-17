import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../app/core/firebase/firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [sales, setSales] = useState([]);

    // Fetch sales from Firebase (run once)
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "sales"));
                const salesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSales(salesData);
            } catch (error) {
                console.error("Error fetching sales:", error);
            }
        };

        fetchSales();
    }, []);

    // Add order to Firebase + update UI instantly
    const confirmOrder = async (newOrder) => {
        try {
            const docRef = await addDoc(collection(db, "sales"), newOrder);

            // Keep  UI instant (like before)
            setSales(prev => [{ id: docRef.id, ...newOrder }, ...prev]);
        } catch (error) {
            console.error("Error adding order:", error);
        }
    };

    return (
        <OrderContext.Provider value={{ sales, confirmOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);