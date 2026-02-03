import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTables } from '../../context/TableContext';
import { useTransactions } from '../../context/TransactionContext';
import { ProductCard } from './ProductCard';
import { Cart } from './Cart';
import { Receipt } from './Receipt';

export function POSLayout({ onBack }) {
    const { products, categories } = useProducts();
    const { activeTableId, tables, updateTableOrder, clearTable, setActiveTableId } = useTables();
    const { addTransaction } = useTransactions();

    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState([]);
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customItem, setCustomItem] = useState({ name: '', price: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('เงินสด');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeTableId) {
            const table = tables.find(t => t.id === activeTableId);
            if (table && table.orders.length > 0) setCart(table.orders);
            else setCart([]);
        }
    }, [activeTableId, tables]);

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateCartItemPrice = (productId, newPrice) => {
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const updateCartItemNote = (productId, note) => {
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, note } : item
        ));
    };

    const addCustomItem = () => {
        if (!customItem.name || !customItem.price) return;

        const newItem = {
            id: `custom-${Date.now()}`,
            name: customItem.name,
            price: parseFloat(customItem.price) || 0,
            quantity: 1,
            category: 'อื่นๆ'
        };

        setCart(prev => [...prev, newItem]);
        setCustomItem({ name: '', price: '' });
        setShowCustomModal(false);
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const handleSaveOrder = () => {
        if (activeTableId) {
            updateTableOrder(activeTableId, cart);
            onBack();
        }
    };

    const getChannelName = () => {
        if (activeTableId === 'takeaway') return '🥡 สั่งกลับบ้าน';
        if (activeTableId === 'lineman') return '🛵 Lineman';
        const table = tables.find(t => t.id === activeTableId);
        return table ? `🪑 โต๊ะ ${table.name}` : 'รายการอาหาร';
    };

    const handleCancelOrder = () => {
        // If cart is empty, just go back immediately
        if (cart.length === 0) {
            onBack();
            return;
        }

        // Check if there are unsaved changes (compared to initial table state)
        let hasChanges = true;
        if (activeTableId) {
            const table = tables.find(t => t.id === activeTableId);
            const initialOrders = table?.orders || [];
            if (JSON.stringify(initialOrders) === JSON.stringify(cart)) {
                hasChanges = false;
            }
        }

        if (!hasChanges) {
            onBack();
            return;
        }

        if (window.confirm('คุณต้องการยกเลิกและละทิ้งรายการที่คีย์อยู่ใช่หรือไม่? ข้อมูลที่ยังไม่บันทึกจะหายไป')) {
            setCart([]);
            onBack();
        }
    };

    const handleCheckout = () => {
        setShowConfirmModal(true);
    };

    const confirmCheckout = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const tax = 0; // Removed VAT
        const total = Math.max(0, subtotal - discount);

        // Determine channel
        let orderChannel = 'โต๊ะ';
        if (activeTableId === 'takeaway') orderChannel = 'กลับบ้าน';
        if (activeTableId === 'lineman') orderChannel = 'Lineman';

        const table = tables.find(t => t.id === activeTableId);
        const channelDisplayName = table ? `โต๊ะ ${table.name}` : orderChannel;

        try {
            // Save transaction and wait for DB response
            const transaction = await addTransaction({
                tableId: activeTableId,
                orderChannel: channelDisplayName,
                items: cart,
                subtotal,
                tax,
                discount,
                total,
                paymentMethod
            });

            if (transaction) {
                setLastTransaction(transaction);
                setShowConfirmModal(false);
                setShowSuccessModal(true);

                // Clear table and cart
                const isTable = typeof activeTableId === 'number';
                if (isTable) {
                    clearTable(activeTableId);
                }
                setCart([]);
                setDiscount(0);
            }
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handlePrint = () => {
        window.print();
    };

    const handleClearTableAction = () => {
        if (!activeTableId || typeof activeTableId !== 'number') return;

        if (window.confirm('คุณต้องการยกเลิกบิลนี้และล้างโต๊ะใช่หรือไม่? รายการอาหารทั้งหมดในโต๊ะนี้จะถูกลบออก')) {
            clearTable(activeTableId);
            setCart([]);
            onBack();
        }
    };

    const finishCheckout = () => {
        setShowSuccessModal(false);
        setCart([]);
        setDiscount(0);
        if (activeTableId) {
            setActiveTableId(null);
            onBack();
        }
    };



    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-[#F3F5F7] overflow-hidden relative">
            {/* Product Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Top Header & Search */}
                <div className="bg-white px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b border-[#DEE2E6] shadow-sm z-10 gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="flex items-center gap-2">
                            {activeTableId && (
                                <button
                                    onClick={handleCancelOrder}
                                    className="px-3 py-2 -ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 group"
                                    title="ยกเลิกและย้อนกลับ"
                                >
                                    <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-bold">กลับ</span>
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-gray-800 truncate">
                                {getChannelName()}
                            </h2>
                        </div>
                        {/* Mobile Cart Toggle */}
                        <button
                            onClick={() => setShowMobileCart(true)}
                            className="md:hidden relative p-2 bg-[#1277E3] text-white rounded-lg shadow-md"
                        >
                            <ShoppingBag size={24} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="w-full md:w-80 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อเมนู..."
                            className="w-full bg-[#F3F5F7] border border-transparent focus:bg-white focus:border-[#1277E3] rounded-lg pl-10 pr-4 py-2 text-sm outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Tabs with Navigation Arrows */}
                <div className="bg-white px-4 border-b border-[#DEE2E6] shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-0 relative group">
                    <div className="relative flex items-center">
                        <button
                            onClick={() => document.getElementById('pos-cat-scroll').scrollBy({ left: -200, behavior: 'smooth' })}
                            className="absolute left-0 z-10 p-1.5 bg-white/90 shadow-md rounded-full border border-gray-100 text-gray-400 hover:text-[#1277E3] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div
                            id="pos-cat-scroll"
                            className="flex gap-4 overflow-x-auto scrollbar-hide py-1 scroll-smooth w-full"
                        >
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`
                                        py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all px-2 flex-shrink-0
                                        ${activeCategory === cat
                                            ? 'border-[#1277E3] text-[#1277E3]'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => document.getElementById('pos-cat-scroll').scrollBy({ left: 200, behavior: 'smooth' })}
                            className="absolute right-0 z-10 p-1.5 bg-white/90 shadow-md rounded-full border border-gray-100 text-gray-400 hover:text-[#1277E3] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ArrowLeft size={16} className="rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section - Sidebar on Desktop, Overlay on Mobile */}
            <div className={`
                fixed inset-0 z-[110] md:relative md:inset-auto md:z-20 md:w-[360px] md:h-full
                transition-transform duration-300 transform
                ${showMobileCart ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.03)] relative">
                    {/* Header for Mobile Cart */}
                    <div className="md:hidden p-4 border-b flex justify-between items-center bg-[#F3F5F7]">
                        <h3 className="font-bold text-gray-800">รายการที่สั่ง</h3>
                        <button
                            onClick={() => setShowMobileCart(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeft className="rotate-180" size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Cart
                            cartItems={cart}
                            onRemoveFromCart={removeFromCart}
                            onUpdatePrice={updateCartItemPrice}
                            onUpdateNote={updateCartItemNote}
                            onAddCustom={() => setShowCustomModal(true)}
                            discount={discount}
                            onUpdateDiscount={setDiscount}
                            onCheckout={() => {
                                handleCheckout();
                                setShowMobileCart(false);
                            }}
                            onSaveOrder={typeof activeTableId === 'number' ? () => {
                                handleSaveOrder();
                                setShowMobileCart(false);
                            } : null}
                            onClearTable={typeof activeTableId === 'number' ? handleClearTableAction : null}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar (Shortcut to Cart) */}
            {cart.length > 0 && !showMobileCart && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-50">
                    <button
                        onClick={() => setShowMobileCart(true)}
                        className="w-full bg-[#1277E3] text-white py-4 rounded-2xl shadow-2xl flex items-center justify-between px-6 pointer-events-auto animate-in slide-in-from-bottom duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                                {cart.reduce((s, i) => s + i.quantity, 0)}
                            </div>
                            <span className="font-bold">รายการอาหาร</span>
                        </div>
                        <span className="text-xl font-black italic">฿{Math.max(0, cart.reduce((s, i) => s + i.price * i.quantity, 0) - discount).toLocaleString()}</span>
                    </button>
                </div>
            )}

            {/* MODALS */}

            {/* 1. Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการชำระเงิน</h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-500 mb-2">ช่องทางการชำระเงิน</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('เงินสด')}
                                    className={`py-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'เงินสด' ? 'border-[#1277E3] bg-[#EAF4FF] text-[#1277E3]' : 'border-gray-100 text-gray-400'}`}
                                >
                                    เงินสด
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('เงินโอน')}
                                    className={`py-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'เงินโอน' ? 'border-[#1277E3] bg-[#EAF4FF] text-[#1277E3]' : 'border-gray-100 text-gray-400'}`}
                                >
                                    เงินโอน
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-500 mb-6 font-medium">ยอดชำระเงินทั้งหมด <span className="text-[#1277E3] text-lg font-bold">฿{Math.max(0, cart.reduce((s, i) => s + i.price * i.quantity, 0) - discount).toLocaleString()}</span></p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmCheckout}
                                disabled={isSubmitting}
                                className={`flex-[2] py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1277E3] hover:bg-[#0E62BC] shadow-blue-200'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>กำลังบันทึก...</span>
                                    </>
                                ) : (
                                    'ยืนยัน'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Success Modal with Print Option */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">ชำระเงินสำเร็จ</h3>
                        <p className="text-gray-500 mb-8">บันทึกข้อมูลและปิดยอดเรียบร้อยแล้ว</p>

                        <div className="space-y-3">
                            <button
                                onClick={handlePrint}
                                className="w-full py-4 rounded-xl font-bold bg-white border-2 border-[#1277E3] text-[#1277E3] hover:bg-[#F0F7FF] transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z"></path></svg>
                                <span>พิมพ์ใบเสร็จ</span>
                            </button>
                            <button
                                onClick={finishCheckout}
                                className="w-full py-4 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all"
                            >
                                ปิดหน้าต่างนี้
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Custom Item Modal */}
            {showCustomModal && (
                <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">เพิ่มรายการอื่นๆ</h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการ</label>
                                <input
                                    type="text"
                                    placeholder="เช่น ค่าจัดส่ง, เมนูพิเศษ..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1277E3] outline-none transition-all"
                                    value={customItem.name}
                                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1277E3] outline-none transition-all"
                                    value={customItem.price}
                                    onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCustomModal(false)}
                                className="flex-1 py-3 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={addCustomItem}
                                className="flex-[2] py-3 rounded-xl font-bold bg-[#1277E3] text-white hover:bg-[#0E62BC] transition-colors"
                            >
                                เพิ่มรายการ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for Printing (Handled by Receipt's own CSS) */}
            <div id="printable-receipt">
                <Receipt transaction={lastTransaction} />
            </div>
        </div>
    );
}
