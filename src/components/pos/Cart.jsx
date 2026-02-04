import React from 'react';
import { Trash2, ShoppingBag, FileText, ChevronRight, PlusCircle } from 'lucide-react';

export function Cart({ cartItems, onRemoveFromCart, onCheckout, onSaveOrder, onUpdatePrice, onUpdateNote, onAddCustom, discount, onUpdateDiscount, onClearTable }) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal - (discount || 0));

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Bill Header */}
            <div className="px-6 py-5 border-b border-[#F0F2F5] flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} className="text-[#1277E3]" />
                        รายการสั่งซื้อ
                    </h3>
                </div>
                {onClearTable && (
                    <button
                        onClick={onClearTable}
                        className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                        ล้างโต๊ะ
                    </button>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                        <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        <p className="text-sm text-center">ยังไม่มีรายการ<br />เลือกเมนูฝั่งซ้ายหรือกดปุ่มเพิ่มอื่นๆ</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="bg-white border border-[#F0F2F5] p-3 rounded-xl group transition-all hover:shadow-sm cart-item-enter">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-6 h-6 bg-[#1277E3] text-white rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {item.quantity}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight break-words">{item.name}</h4>
                                        <input
                                            type="text"
                                            placeholder="เพิ่มหมายเหตุ..."
                                            className="w-full mt-1 text-[11px] text-gray-400 italic bg-transparent border-none focus:ring-0 p-0 outline-none"
                                            value={item.note || ''}
                                            onChange={(e) => onUpdateNote(item.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveFromCart(item.id)}
                                    className="text-gray-300 hover:text-red-500 p-1 transition-colors ml-2"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-1 border-t border-dashed border-gray-100 pt-2">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <span className="text-[10px] font-bold">฿</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-[#F8F9FA] border-none text-xs font-bold text-gray-700 p-1 rounded focus:ring-1 focus:ring-[#1277E3] outline-none"
                                        value={item.price}
                                        onChange={(e) => onUpdatePrice(item.id, e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400 block -mb-1">รวม</span>
                                    <span className="font-black text-[#1277E3] text-base">
                                        ฿{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Payment Footer */}
            <div className="p-4 bg-white border-t-2 border-[#F3F5F7]">
                <div className="flex justify-center mb-2">
                    <button
                        onClick={onAddCustom}
                        className="w-full py-2.5 text-[#1277E3] hover:bg-[#EAF4FF] rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold border border-dashed border-blue-200"
                    >
                        <PlusCircle size={16} />
                        <span>เพิ่มรายการอื่นๆ (เช่น ค่าส่ง, เมนูพิเศษ)</span>
                    </button>
                </div>

                <div className="space-y-2 mb-4 bg-[#F8F9FA] p-4 rounded-2xl">
                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                        <span>ยอดรวมสินค้า</span>
                        <span>฿{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                        <span>ส่วนลด (บาท)</span>
                        <input
                            type="number"
                            className="w-20 bg-white border border-gray-200 text-right px-2 py-1 rounded text-xs font-bold text-red-500 outline-none focus:border-red-300"
                            placeholder="0"
                            value={discount || ''}
                            onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                        <span className="text-base font-bold text-gray-900">ยอดสุทธิ</span>
                        <span className="text-2xl font-black text-[#1277E3]">฿{total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {onSaveOrder && (
                        <button
                            onClick={onSaveOrder}
                            disabled={cartItems.length === 0}
                            className="flex-1 py-4 rounded-xl font-bold bg-white border-2 border-[#DEE2E6] text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95"
                        >
                            ค้างโต๊ะ
                        </button>
                    )}

                    <button
                        onClick={onCheckout}
                        disabled={cartItems.length === 0}
                        className={`${onSaveOrder ? 'flex-[2]' : 'w-full'} py-4 rounded-xl font-black bg-[#1277E3] text-white hover:bg-[#0E62BC] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2`}
                    >
                        <span>ชำระเงิน</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
