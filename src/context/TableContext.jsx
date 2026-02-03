import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TableContext = createContext();

export function useTables() {
    return useContext(TableContext);
}

export function TableProvider({ children }) {
    // Initial static table definitions
    const initialTables = [
        ...Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `${i + 1}` })),
        { id: 10, name: 'ครอบครัว' }
    ];

    const [tables, setTables] = useState(initialTables.map(t => ({
        ...t,
        status: 'available',
        orders: [],
        startTime: null
    })));

    const [activeTableId, setActiveTableId] = useState(null);

    useEffect(() => {
        fetchTableStatuses();

        // Subscribe to real-time table updates
        const subscription = supabase
            .channel('table-orders-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'table_orders' }, payload => {
                const updatedOrder = payload.new;
                setTables(prev => prev.map(t => {
                    if (String(t.id) === String(updatedOrder.table_id)) {
                        return {
                            ...t,
                            status: updatedOrder.status,
                            orders: updatedOrder.orders || [],
                            startTime: updatedOrder.start_time
                        };
                    }
                    return t;
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    async function fetchTableStatuses() {
        const { data, error } = await supabase
            .from('table_orders')
            .select('*');

        if (error) {
            console.error('Error fetching table statuses:', error);
            return;
        }

        if (data) {
            setTables(prev => prev.map(t => {
                const remote = data.find(d => String(d.table_id) === String(t.id));
                if (remote) {
                    return {
                        ...t,
                        status: remote.status,
                        orders: remote.orders || [],
                        startTime: remote.start_time
                    };
                }
                return t;
            }));
        }
    }

    const updateTableOrder = async (tableId, newItems) => {
        const isOccupied = newItems.length > 0;
        const newStatus = isOccupied ? 'occupied' : 'available';
        const targetTable = tables.find(t => String(t.id) === String(tableId));

        const startTime = (targetTable?.status === 'available' && isOccupied)
            ? new Date().toISOString()
            : targetTable?.startTime;

        // Optimistic Update: Update local state immediately
        setTables(prev => prev.map(t => {
            if (String(t.id) === String(tableId)) {
                return {
                    ...t,
                    status: newStatus,
                    orders: newItems,
                    startTime: startTime
                };
            }
            return t;
        }));

        const { error } = await supabase
            .from('table_orders')
            .upsert({
                table_id: String(tableId),
                status: newStatus,
                orders: newItems,
                start_time: startTime
            });

        if (error) {
            console.error('Error updating table order:', error);
            // Revert on error if necessary, though fetchTableStatuses will eventually sync it
            fetchTableStatuses();
        }
    };

    const clearTable = async (tableId) => {
        // Optimistic Update: Update local state immediately
        setTables(prev => prev.map(t => {
            if (String(t.id) === String(tableId)) {
                return {
                    ...t,
                    status: 'available',
                    orders: [],
                    startTime: null
                };
            }
            return t;
        }));

        const { error } = await supabase
            .from('table_orders')
            .update({
                status: 'available',
                orders: [],
                start_time: null
            })
            .eq('table_id', String(tableId));

        if (error) {
            console.error('Error clearing table:', error);
            fetchTableStatuses();
        }
    };

    return (
        <TableContext.Provider value={{ tables, activeTableId, setActiveTableId, updateTableOrder, clearTable }}>
            {children}
        </TableContext.Provider>
    );
}
