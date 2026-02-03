import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TransactionContext = createContext();

export function useTransactions() {
    return useContext(TransactionContext);
}

export function TransactionProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();

        // Subscribe to new transactions
        const subscription = supabase
            .channel('transactions-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) console.error('Error fetching transactions:', error);
        else setTransactions(data || []);

        setLoading(false);
    };

    const addTransaction = async (transactionData) => {
        const newTransaction = {
            table_id: String(transactionData.tableId) || null,
            order_channel: transactionData.orderChannel || 'อื่นๆ',
            items: transactionData.items,
            subtotal: transactionData.subtotal,
            tax: transactionData.tax || 0,
            discount: transactionData.discount || 0,
            total: transactionData.total,
            payment_method: transactionData.paymentMethod || 'เงินสด',
            timestamp: new Date().toISOString()
        };

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticTransaction = { ...newTransaction, id: tempId };
        setTransactions(prev => [optimisticTransaction, ...prev]);

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                table_id: newTransaction.table_id,
                order_channel: newTransaction.order_channel,
                items: newTransaction.items,
                subtotal: newTransaction.subtotal,
                tax: newTransaction.tax,
                discount: newTransaction.discount,
                total: newTransaction.total,
                payment_method: newTransaction.payment_method
            }])
            .select()
            .single();

        if (error) {
            alert('Error adding transaction: ' + error.message);
            // Revert optimistic update
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            return null;
        }

        // Replace optimistic entry with real DB data
        setTransactions(prev => prev.map(t => t.id === tempId ? data : t));
        return data;
    };

    const deleteTransaction = async (id) => {
        if (window.confirm('คุณต้องการลบบิลนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            // Optimistic Update
            const deletedTransaction = transactions.find(t => t.id === id);
            setTransactions(prev => prev.filter(t => t.id !== id));

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Error deleting transaction: ' + error.message);
                // Revert
                if (deletedTransaction) setTransactions(prev => [deletedTransaction, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            }
        }
    };

    const updateTransaction = async (id, updatedData) => {
        // Optimistic Update
        const originalTransactions = [...transactions];
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));

        const { error } = await supabase
            .from('transactions')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            alert('Error updating transaction: ' + error.message);
            setTransactions(originalTransactions);
        }
    };

    return (
        <TransactionContext.Provider value={{ transactions, loading, addTransaction, deleteTransaction, updateTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
}
