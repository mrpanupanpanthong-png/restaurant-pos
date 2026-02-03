import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Trash2, Edit2, Save, ChevronUp, ChevronDown, FolderPlus, X, ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export function MenuManagement() {
    const {
        products,
        categories,
        addProduct,
        updateProduct,
        removeProduct,
        addCategory,
        removeCategory,
        reorderProducts,
        reorderCategories
    } = useProducts();

    const [activeTab, setActiveTab] = useState('All');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' });

    const [editingProductId, setEditingProductId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', category: '' });
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Filter products by active category
    const filteredProducts = products
        .filter(p => activeTab === 'All' || p.category === activeTab)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleAddCategory = () => {
        if (!newCategoryName) return;
        addCategory(newCategoryName);
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;
        addProduct({
            ...newProduct,
            price: Number(newProduct.price),
            category: activeTab
        });
        setNewProduct({ name: '', price: '', category: '' });
        setIsAddingProduct(false);
    };

    const startEditing = (product) => {
        setEditingProductId(product.id);
        setEditForm({ name: product.name, price: product.price, category: product.category });
    };

    const handleUpdateProduct = (id) => {
        updateProduct(id, {
            ...editForm,
            price: Number(editForm.price)
        });
        setEditingProductId(null);
    };

    const moveProduct = async (id, direction) => {
        const index = filteredProducts.findIndex(p => p.id === id);
        if (index === -1) return;

        const newFiltered = [...filteredProducts];
        let targetIndex = -1;

        if (direction === 'up' && index > 0) targetIndex = index - 1;
        else if (direction === 'down' && index < newFiltered.length - 1) targetIndex = index + 1;

        if (targetIndex !== -1) {
            // Swap in the local filtered list
            const temp = newFiltered[index];
            newFiltered[index] = newFiltered[targetIndex];
            newFiltered[targetIndex] = temp;

            // We need to update the 'order' field for all products based on this new relative order
            // To be safe and consistent, we'll assign orders based on their new positions in the full list
            // but for simplicity and to avoid global side effects, we just update the orders of the two swapped items

            const item1 = newFiltered[index];
            const item2 = newFiltered[targetIndex];

            // Re-map the 'order' values
            const updates = [
                updateProduct(item1.id, { order: index }),
                updateProduct(item2.id, { order: targetIndex })
            ];

            // If we want it to be perfectly sequential within the category, 
            // we should probably update all items in newFiltered
            const allUpdates = newFiltered.map((p, idx) => updateProduct(p.id, { order: idx }));
            await Promise.all(allUpdates);
        }
    };

    const moveCategoryItem = (name, direction) => {
        const index = categories.indexOf(name);
        if (index === -1) return;

        const newCategories = [...categories];
        if (direction === 'left' && index > 1) {
            const temp = newCategories[index];
            newCategories[index] = newCategories[index - 1];
            newCategories[index - 1] = temp;
            reorderCategories(newCategories);
        } else if (direction === 'right' && index < categories.length - 1 && index > 0) {
            const temp = newCategories[index];
            newCategories[index] = newCategories[index + 1];
            newCategories[index + 1] = temp;
            reorderCategories(newCategories);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#F3F5F7]">
            <header className="bg-white p-6 md:p-8 border-b border-[#DEE2E6]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800">ตั้งค่าเมนูอาหาร</h2>
                        <p className="text-gray-500 font-medium">จัดการรายการอาหาร หมวดหมู่ และลำดับการแสดงผล</p>
                    </div>
                </div>
            </header>

            {/* Category Management with Navigation Arrows */}
            <div className="bg-white px-8 pt-8 border-b border-[#DEE2E6] flex items-center gap-2 relative group overflow-visible">
                <button
                    onClick={() => document.getElementById('menu-cat-scroll').scrollBy({ left: -200, behavior: 'smooth' })}
                    className="absolute left-2 top-[60%] -translate-y-1/2 z-30 p-1.5 bg-white/95 shadow-md rounded-full border border-gray-100 text-gray-400 hover:text-[#1277E3] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ArrowLeft size={16} />
                </button>

                <div
                    id="menu-cat-scroll"
                    className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 flex-1 scroll-smooth pb-0 relative"
                    style={{ overflowY: 'visible' }}
                >
                    {categories.map(cat => (
                        <div key={cat} className="relative group flex-shrink-0 pt-4">
                            <button
                                onClick={() => setActiveTab(cat)}
                                className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-4 whitespace-nowrap ${activeTab === cat ? 'bg-[#F3F5F7] text-[#1277E3] border-[#1277E3]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                            >
                                {cat}
                            </button>
                            {cat !== 'All' && (
                                <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20 transform -translate-y-1">
                                    {categories.indexOf(cat) > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveCategoryItem(cat, 'left'); }}
                                            className="bg-[#1277E3] text-white rounded-full p-1 shadow-lg hover:bg-blue-600 hover:scale-110 transition-transform"
                                            title="เลื่อนซ้าย"
                                        >
                                            <ChevronLeft size={12} />
                                        </button>
                                    )}
                                    {categories.indexOf(cat) < categories.length - 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveCategoryItem(cat, 'right'); }}
                                            className="bg-[#1277E3] text-white rounded-full p-1 shadow-lg hover:bg-blue-600 hover:scale-110 transition-transform"
                                            title="เลื่อนขวา"
                                        >
                                            <ChevronRight size={12} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCategoryToDelete(cat);
                                        }}
                                        className="bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 hover:scale-110 transition-transform"
                                        title="ลบ"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex-shrink-0 pt-4">
                        {isAddingCategory ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-t-xl border border-[#DEE2E6] border-b-0">
                                <input
                                    autoFocus
                                    className="w-32 bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#1277E3]"
                                    placeholder="ชื่อหมวดหมู่..."
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button onClick={handleAddCategory} className="text-green-500"><Plus size={16} /></button>
                                <button onClick={() => setIsAddingCategory(false)} className="text-gray-400"><X size={16} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-gray-400 hover:text-[#1277E3] transition-colors whitespace-nowrap"
                            >
                                <FolderPlus size={18} />
                                <span>เพิ่มหมวดหมู่</span>
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => document.getElementById('menu-cat-scroll').scrollBy({ left: 200, behavior: 'smooth' })}
                    className="absolute right-[190px] top-[60%] -translate-y-1/2 z-30 p-1.5 bg-white/90 shadow-md rounded-full border border-gray-100 text-gray-400 hover:text-[#1277E3] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ArrowLeft size={16} className="rotate-180" />
                </button>

                <button
                    onClick={() => setIsAddingProduct(true)}
                    className="mb-2 px-4 py-2.5 bg-[#1277E3] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 flex-shrink-0 z-10"
                >
                    <Plus size={18} />
                    เพิ่มเมนูในหมวดนี้
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {/* Add Product Modal/Form */}
                {isAddingProduct && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">เพิ่มเมนูใหม่ในหมวด {activeTab}</h3>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อเมนู</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-[#1277E3] focus:ring-1 focus:ring-[#1277E3] outline-none transition-all"
                                        placeholder="เช่น ข้าวผัดไข่"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">ราคา (บาท)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-[#1277E3] focus:ring-1 focus:ring-[#1277E3] outline-none transition-all"
                                        placeholder="เช่น 50"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingProduct(false)}
                                        className="flex-1 py-3 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 rounded-xl font-bold bg-[#1277E3] text-white hover:bg-[#0E62BC] transition-colors shadow-lg shadow-blue-100"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table View */}
                <div className="bg-white border border-[#DEE2E6] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4 w-16 text-center">ลำดับ</th>
                                <th className="p-4">ชื่อเมนู</th>
                                <th className="p-4 w-32">ราคา</th>
                                <th className="p-4 w-40 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-300">
                                            <FolderPlus size={48} strokeWidth={1} />
                                            <p className="font-medium">ไม่มีรายการอาหารในหมวดนี้</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <button
                                                    onClick={() => moveProduct(product.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-300 hover:text-[#1277E3] disabled:opacity-0 transition-colors"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                                <button
                                                    onClick={() => moveProduct(product.id, 'down')}
                                                    disabled={index === filteredProducts.length - 1}
                                                    className="p-1 text-gray-300 hover:text-[#1277E3] disabled:opacity-0 transition-colors"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {editingProductId === product.id ? (
                                                <input
                                                    className="w-full bg-white border border-[#1277E3] p-2 rounded-lg text-sm font-bold outline-none"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            ) : (
                                                <div className="font-bold text-gray-800">{product.name}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {editingProductId === product.id ? (
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-[#1277E3] p-2 rounded-lg text-sm font-bold outline-none text-[#1277E3]"
                                                    value={editForm.price}
                                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                                />
                                            ) : (
                                                <div className="font-black text-[#1277E3]">฿{product.price}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {editingProductId === product.id ? (
                                                    <button
                                                        onClick={() => handleUpdateProduct(product.id)}
                                                        className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(product)}
                                                        className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-[#EAF4FF] hover:text-[#1277E3] transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { if (window.confirm('ยืนยันการลบเมนูนี้?')) removeProduct(product.id); }}
                                                    className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {categoryToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการลบหมวดหมู่?</h3>
                            <p className="text-gray-500 text-sm mb-8">
                                คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ <span className="font-bold text-gray-800">"{categoryToDelete}"</span>?
                                <br />เมนูในหมวดนี้จะไม่แสดงผลจนกว่าจะเลือกหมวดใหม่
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setCategoryToDelete(null)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => {
                                        removeCategory(categoryToDelete);
                                        if (activeTab === categoryToDelete) setActiveTab('All');
                                        setCategoryToDelete(null);
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95"
                                >
                                    ยืนยันลบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
