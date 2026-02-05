import React, { useState, useMemo } from 'react';
import { Receipt, Calendar, ShoppingBag, ChevronDown, ChevronUp, Trash2, Plus, X, Search, CreditCard, Banknote, Clock, Filter } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useProducts } from '../../context/ProductContext';

export function TransactionHistory() {
    const { transactions, deleteTransaction, updateTransaction } = useTransactions();
    const { products } = useProducts();
    const [expandedId, setExpandedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // --- ระบบกรองข้อมูล (Filter System) ---
    const [dateRange, setDateRange] = useState('today'); // today, week, month, all
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // ฟังก์ชันแสดงผลบนหัวบิล: ล็อกให้เป็น วัน/เดือน/ปี (ค.ศ.) เสมอ
    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);

        // ใช้ Intl เพื่อบังคับลำดับ Day, Month, Year
        const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date);
        const month = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(date);
        const year = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(date);
        const time = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);

        return `${day}/${month}/${year}, ${time}`; // จะได้เป็น 04/02/2026 เสมอ
    };

    // ฟังก์ชันสำหรับ Input: ต้องแม่นยำเพื่อไม่ให้บันทึกผิดวัน
    const formatForInput = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);

        // บังคับฟอร์แมต YYYY-MM-DDTHH:mm สำหรับ datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // --- ส่วนประมวลผลบิล (ใช้ useMemo เพื่อความเร็ว) ---
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // 1. กรองตามวันที่
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (dateRange === 'today') {
            result = result.filter(t => new Date(t.timestamp).getTime() >= today);
        } else if (dateRange === 'week') {
            const weekAgo = today - (7 * 24 * 60 * 60 * 1000);
            result = result.filter(t => new Date(t.timestamp).getTime() >= weekAgo);
        } else if (dateRange === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            result = result.filter(t => new Date(t.timestamp).getTime() >= monthStart);
        } else if (dateRange === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate).getTime();
            const end = new Date(customEndDate).getTime() + (24 * 60 * 60 * 1000); // รวมทั้งวัน
            result = result.filter(t => {
                const time = new Date(t.timestamp).getTime();
                return time >= start && time <= end;
            });
        }

        // 2. เรียงลำดับ (บิลล่าสุดขึ้นก่อนเสมอ)
        return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [transactions, dateRange, customStartDate, customEndDate]);

    const toggleExpand = (id) => {
        if (expandedId === id && isEditing) {
            if (!window.confirm('คุณยังไม่ได้บันทึกการแก้ไข ต้องการปิดใช่หรือไม่?')) return;
        }
        setExpandedId(expandedId === id ? null : id);
        setIsEditing(false);
    };

    const handleUpdateDate = (transaction, newDateTime) => {
        if (!newDateTime) return;
        updateTransaction(transaction.id, { timestamp: new Date(newDateTime).toISOString() });
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
        const newItems = [...transaction.items, { ...product, quantity: 1, note: '' }];
        recalculate(transaction, newItems);
    };

    const recalculate = (transaction, items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = Math.max(0, subtotal - (transaction.discount || 0));
        updateTransaction(transaction.id, { items, subtotal, total });
    };

    return (
        <div className="h-full bg-[#F3F5F7] flex flex-col">
            <header className="bg-white p-6 border-b border-[#DEE2E6]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                            <Receipt className="text-[#1277E3]" size={28} />
                            ประวัติการขาย
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            แสดงบิล {filteredTransactions.length} รายการ จากทั้งหมด {transactions.length}
                        </p>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                            {[
                                { id: 'today', label: 'วันนี้' },
                                { id: 'week', label: '7 วัน' },
                                { id: 'month', label: 'เดือนนี้' },
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'custom', label: 'ระบุวันที่' }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => setDateRange(btn.id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dateRange === btn.id ? 'bg-white text-[#1277E3] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Date Inputs */}
                {dateRange === 'custom' && (
                    <div className="mt-4 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <input
                            type="date"
                            className="text-sm border rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#1277E3]"
                            onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <span className="text-gray-400">ถึง</span>
                        <input
                            type="date"
                            className="text-sm border rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#1277E3]"
                            onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">ไม่พบบิลในช่วงเวลานี้</h3>
                        <p className="text-sm text-gray-400">ลองเปลี่ยนช่วงเวลาหรือค้นหาใหม่</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${expandedId === transaction.id ? 'border-[#1277E3] shadow-xl' : 'border-[#DEE2E6] hover:shadow-md'}`}>

                                {/* Transaction Header */}
                                <div className="p-5 cursor-pointer flex items-center justify-between" onClick={() => toggleExpand(transaction.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedId === transaction.id ? 'bg-[#1277E3] text-white' : 'bg-[#EAF4FF] text-[#1277E3]'}`}>
                                            <Receipt size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{transaction.orderChannel} <span className="text-[10px] text-gray-400 ml-1">#{transaction.id.toString().slice(-6)}</span></h3>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 font-medium mt-0.5"><Calendar size={12} /> {formatDate(transaction.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <p className="text-xl font-black text-[#1277E3]">฿{transaction.total.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{transaction.payment_method || 'เงินสด'}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${expandedId === transaction.id ? 'bg-blue-50 text-[#1277E3]' : 'text-gray-300'}`}>
                                            {expandedId === transaction.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === transaction.id && (
                                    <div className="border-t border-[#DEE2E6] bg-[#F8F9FA] p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-bold text-gray-700 flex items-center gap-2"><ShoppingBag size={18} className="text-[#1277E3]" /> บิลรายละเอียด</h4>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-green-500 text-white' : 'bg-white border text-gray-600'}`}>{isEditing ? 'บันทึกเรียบร้อย' : 'แก้ไขบิล'}</button>
                                                <button onClick={(e) => { e.stopPropagation(); if (window.confirm('ลบบิลนี้?')) deleteTransaction(transaction.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mb-6 p-4 bg-white rounded-2xl border border-blue-100 flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-[#1277E3]">
                                                    <Clock size={20} />
                                                    <div>
                                                        <label className="block text-[10px] font-black text-blue-400">แก้ไขวัน/เวลาขาย</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="font-bold text-gray-700 outline-none border-b-2 border-transparent focus:border-blue-500"
                                                            defaultValue={formatForInput(transaction.timestamp)}
                                                            onBlur={(e) => e.target.value && handleUpdateDate(transaction, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                {transaction.items.map((item, idx) => (
                                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            {isEditing && <button onClick={() => handleRemoveItem(transaction, idx)} className="text-red-400"><X size={16} /></button>}
                                                            <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            {isEditing ? (
                                                                <input type="number" className="w-12 text-center bg-gray-50 rounded" value={item.quantity} onChange={(e) => handleUpdateItem(transaction, idx, { quantity: parseInt(e.target.value) || 1 })} />
                                                            ) : (
                                                                <span className="text-sm font-black">฿{(item.price * item.quantity).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {isEditing && (
                                                <div className="bg-white p-4 rounded-xl border flex flex-col h-[300px]">
                                                    <div className="relative mb-2">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                                        <input placeholder="เพิ่มรายการ..." className="w-full pl-8 pr-4 py-1.5 bg-gray-50 rounded-lg text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                                    </div>
                                                    <div className="overflow-y-auto space-y-1">
                                                        {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                                            <button key={p.id} onClick={() => handleAddItem(transaction, p)} className="w-full text-left p-2 hover:bg-blue-50 rounded flex justify-between text-xs font-bold">
                                                                <span>{p.name}</span> <span className="text-blue-500">฿{p.price}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 border-t flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">ยอดสุทธิรวม</p>
                                                <p className="text-3xl font-black text-[#1277E3]">฿{transaction.total.toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => window.print()} className="px-6 py-2 bg-white border-2 border-[#1277E3] text-[#1277E3] rounded-xl font-bold hover:bg-blue-50">พิมพ์ใบเสร็จ</button>
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