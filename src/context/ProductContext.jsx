import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export function useProducts() {
    return useContext(ProductContext);
}

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('order', { ascending: true });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
    }, []);

    const fetchCategories = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            // Fallback if 'order' column is missing or error: fetch by name
            const { data: fallbackData } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            const catNames = fallbackData?.map(c => c.name) || [];
            setCategories(['All', ...catNames]);
        } else {
            const catNames = data?.map(c => c.name) || [];
            setCategories(['All', ...catNames]);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoading(false);
        };
        load();

        const productsSubscription = supabase
            .channel('products-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
            .subscribe();

        const categoriesSubscription = supabase
            .channel('categories-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
            .subscribe();

        return () => {
            supabase.removeChannel(productsSubscription);
            supabase.removeChannel(categoriesSubscription);
        };
    }, [fetchProducts, fetchCategories]);

    const addProduct = async (newProduct) => {
        const { error } = await supabase
            .from('products')
            .insert([{
                ...newProduct,
                order: products.length
            }]);
        if (error) alert('Error adding product: ' + error.message);
        else await fetchProducts(); // Manual fetch for immediate update
    };

    const updateProduct = async (id, updatedData) => {
        const { error } = await supabase
            .from('products')
            .update(updatedData)
            .eq('id', id);
        if (error) alert('Error updating product: ' + error.message);
        else await fetchProducts();
    };

    const removeProduct = async (id) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) alert('Error removing product: ' + error.message);
        else await fetchProducts();
    };

    const addCategory = async (name) => {
        const { error } = await supabase
            .from('categories')
            .insert([{ name }]);
        if (error) alert('Error adding category: ' + error.message);
        else await fetchCategories(); // Manual fetch for immediate update
    };

    const removeCategory = async (name) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('name', name);
        if (error) alert('Error removing category: ' + error.message);
        else await fetchCategories();
    };

    const reorderCategories = async (newCategoryNames) => {
        // Update local state immediately for instant feedback
        setCategories(newCategoryNames);

        // Skip 'All' as it's not in the DB
        const dbCategories = newCategoryNames.filter(name => name !== 'All');

        // Update each category's order in the DB
        const updates = dbCategories.map((name, index) =>
            supabase.from('categories').update({ order: index }).eq('name', name)
        );

        try {
            await Promise.all(updates);
        } catch (err) {
            console.error('Reorder error (check if "order" column exists in categories table):', err);
        }
        // No need to fetch immediately as we already updated state locally 
        // and subscriptions will handle synced updates eventually
    };

    const reorderProducts = async (newProducts) => {
        const updates = newProducts.map((p, index) =>
            supabase.from('products').update({ order: index }).eq('id', p.id)
        );
        await Promise.all(updates);
        await fetchProducts();
    };

    return (
        <ProductContext.Provider value={{
            products,
            categories,
            loading,
            addProduct,
            updateProduct,
            removeProduct,
            addCategory,
            removeCategory,
            reorderProducts,
            reorderCategories
        }}>
            {children}
        </ProductContext.Provider>
    );
}
