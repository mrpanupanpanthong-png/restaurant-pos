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

    // แก้ไขฟังก์ชัน addTransaction ใน TransactionContext.js
    const addTransaction = async (transactionData, days = 0) => { // 1. เพิ่ม parameter 'days'
        // 2. คำนวณวันที่ตามที่เลือกย้อนหลัง
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - days);

        const tempId = `temp-${Date.now()}`;
        const newTransaction = {
            table_id: String(transactionData.tableId) || null,
            order_channel: transactionData.orderChannel || 'อื่นๆ',
            items: transactionData.items,
            subtotal: transactionData.subtotal,
            tax: transactionData.tax || 0,
            discount: transactionData.discount || 0,
            total: transactionData.total,
            payment_method: transactionData.paymentMethod || 'เงินโอน',
            timestamp: transactionDate.toISOString() // 3. ใช้วันที่ที่คำนวณแล้ว
        };

        // Optimistic Update (แสดงผลหน้าจอก่อน)
        setTransactions(prev => [{ ...newTransaction, id: tempId }, ...prev]);

        try {
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
                    payment_method: newTransaction.payment_method,
                    // 4. บังคับส่งค่า timestamp ลง Database
                    timestamp: newTransaction.timestamp
                }])
                .select()
                .single();

            if (error) throw error;

            setTransactions(prev => prev.map(t => t.id === tempId ? data : t));
            return data;

        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('บันทึกไม่สำเร็จ: ' + error.message);
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            return null;
        }
    };

    const deleteTransaction = async (id) => {
        if (window.confirm('คุณต้องการลบบิลนี้ใช่หรือไม่?')) {
            const deletedTransaction = transactions.find(t => t.id === id);
            setTransactions(prev => prev.filter(t => t.id !== id));

            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) {
                alert('Error: ' + error.message);
                if (deletedTransaction) setTransactions(prev => [deletedTransaction, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            }
        }
    };

    const updateTransaction = async (id, updatedData) => {
        const original = [...transactions];
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
        const { error } = await supabase.from('transactions').update(updatedData).eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
            setTransactions(original);
        }
    };

    return (
        <TransactionContext.Provider value={{ transactions, loading, addTransaction, deleteTransaction, updateTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
}