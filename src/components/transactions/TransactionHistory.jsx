import React, { useState } from 'react';
import { Receipt, Calendar, ShoppingBag, ChevronDown, ChevronUp, Trash2, Plus, X, Search, CreditCard, Banknote } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useProducts } from '../../context/ProductContext';

export function TransactionHistory() {
    const { transactions, deleteTransaction, updateTransaction } = useTransactions();
    const { products } = useProducts();
    const [expandedId, setExpandedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleExpand = (id) => {
        if (expandedId === id && isEditing) {
            if (!window.confirm('คุณยังไม่ได้บันทึกการแก้ไข ต้องการปิดใช่หรือไม่?')) return;
        }
        setExpandedId(expandedId === id ? null : id);
        setIsEditing(false);
    };

    const handleUpdateItem = (transaction, itemIndex, updates) => {
        const newItems = [...transaction.items];
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
        recalculate(transaction, newItems);
    };

    const handleRemoveItem = (transaction, itemIndex) => {
        const newItems = transaction.items.filter((_, i) => i !== itemIndex);
        recalculate(transaction, newItems);
    };

    const handleAddItem = (transaction, product) => {
        const newItems = [...transaction.items, {
            ...product,
            quantity: 1,
            note: ''
        }];
        recalculate(transaction, newItems);
    };

    const recalculate = (transaction, items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = Math.max(0, subtotal - (transaction.discount || 0));

        updateTransaction(transaction.id, {
            items,
            subtotal,
            total
        });
    };

    const filteredCatalog = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full bg-[#F3F5F7] flex flex-col">
            <header className="bg-white p-6 md:p-8 border-b border-[#DEE2E6]">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                        <Receipt className="text-[#1277E3]" size={32} />
                        ประวัติการขาย
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">รายการบิลทั้งหมด {transactions.length} รายการ (รองรับการแก้ไขบิลย้อนหลัง)</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {transactions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm">
                        <div className="w-24 h-24 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีรายการขาย</h3>
                        <p className="text-gray-400 font-medium">เมื่อมีการชำระเงิน ประวัติจะแสดงที่นี่</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${expandedId === transaction.id ? 'border-[#1277E3] shadow-xl' : 'border-[#DEE2E6] hover:shadow-md'}`}>
                                {/* Transaction Header */}
                                <div
                                    className="p-5 cursor-pointer flex items-center justify-between"
                                    onClick={() => toggleExpand(transaction.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedId === transaction.id ? 'bg-[#1277E3] text-white' : 'bg-[#EAF4FF] text-[#1277E3]'}`}>
                                            <Receipt size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    {transaction.orderChannel}
                                                </h3>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded uppercase tracking-wider">
                                                    #{transaction.id.toString().slice(-6)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 flex items-center gap-1 font-medium mt-0.5">
                                                <Calendar size={14} />
                                                {formatDate(transaction.timestamp)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-[#1277E3]">฿{transaction.total.toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                {transaction.paymentMethod === 'เงินโอน' ? <CreditCard size={10} /> : <Banknote size={10} />}
                                                {transaction.paymentMethod || 'เงินสด'}
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg transition-colors ${expandedId === transaction.id ? 'bg-[#1277E3]/10 text-[#1277E3]' : 'text-gray-300'}`}>
                                            {expandedId === transaction.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === transaction.id && (
                                    <div className="border-t border-[#DEE2E6] bg-[#F8F9FA] animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                                    <ShoppingBag size={18} className="text-[#1277E3]" />
                                                    รายการสินค้าในบิล
                                                </h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setIsEditing(!isEditing)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {isEditing ? 'เสร็จสิ้นการแก้ไข' : 'แก้ไขรายการนี้'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteTransaction(transaction.id); }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบบิลถาวร"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Items List */}
                                                <div className="space-y-2">
                                                    {transaction.items.map((item, index) => (
                                                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3">
                                                                    {isEditing && (
                                                                        <button
                                                                            onClick={() => handleRemoveItem(transaction, index)}
                                                                            className="text-red-400 hover:text-red-600 p-1"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                    <div className="font-bold text-gray-800">{item.name}</div>
                                                                </div>
                                                                {item.note && <div className="text-xs text-gray-400 italic mt-0.5 pl-7">หมายเหตุ: {item.note}</div>}
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            className="w-12 text-center font-bold bg-gray-50 border-none rounded p-1 text-sm outline-none focus:ring-1 focus:ring-[#1277E3]"
                                                                            value={item.quantity}
                                                                            onChange={(e) => handleUpdateItem(transaction, index, { quantity: parseInt(e.target.value) || 1 })}
                                                                        />
                                                                        <span className="text-gray-300">x</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 text-right font-bold bg-gray-50 border-none rounded p-1 text-sm outline-none focus:ring-1 focus:ring-[#1277E3] text-[#1277E3]"
                                                                            value={item.price}
                                                                            onChange={(e) => handleUpdateItem(transaction, index, { price: parseFloat(e.target.value) || 0 })}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-right">
                                                                        <div className="text-xs text-gray-400 font-bold">{item.quantity} x {item.price.toLocaleString()}</div>
                                                                        <div className="font-black text-gray-800">฿{(item.price * item.quantity).toLocaleString()}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Item Panel (Visible only when editing) */}
                                                {isEditing && (
                                                    <div className="bg-white p-4 rounded-xl border border-[#DEE2E6] flex flex-col h-[400px]">
                                                        <div className="relative mb-4">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                            <input
                                                                placeholder="ค้นหาอาหารเพิ่ม..."
                                                                className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#1277E3]"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto space-y-1">
                                                            {filteredCatalog.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => handleAddItem(transaction, p)}
                                                                    className="w-full text-left p-3 rounded-lg hover:bg-[#EAF4FF] group transition-colors flex justify-between items-center"
                                                                >
                                                                    <div>
                                                                        <div className="text-sm font-bold text-gray-700 group-hover:text-[#1277E3]">{p.name}</div>
                                                                        <div className="text-[10px] text-gray-400">{p.category}</div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-black text-gray-400">฿{p.price}</div>
                                                                        <div className="bg-[#1277E3] text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Plus size={14} />
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Summary */}
                                            <div className="mt-8 pt-6 border-t border-[#DEE2E6] flex flex-col md:flex-row justify-between items-end gap-4">
                                                <div className="space-y-1 w-full md:w-64">
                                                    <div className="flex justify-between text-sm text-gray-400 font-bold">
                                                        <span>ยอดรวมสินค้า</span>
                                                        <span>฿{transaction.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    {transaction.discount > 0 && (
                                                        <div className="flex justify-between text-sm text-red-400 font-bold">
                                                            <span>ส่วนลด</span>
                                                            <span>-฿{transaction.discount.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200 mt-2">
                                                        <span className="text-lg font-bold text-gray-800">ยอดสุทธิรวม</span>
                                                        <span className="text-3xl font-black text-[#1277E3]">฿{transaction.total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <button
                                                        onClick={() => window.print()}
                                                        className="px-8 py-3 bg-white border-2 border-[#1277E3] text-[#1277E3] rounded-xl font-bold hover:bg-[#EAF4FF] transition-all"
                                                    >
                                                        พิมพ์ใบเสร็จอีกครั้ง
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
