import React from 'react';
import { useTables } from '../../context/TableContext';
import { User, Clock, CheckCircle, AlertCircle, ShoppingBag, Bike } from 'lucide-react';

export function TableLayout({ onTableSelect }) {
    const { tables } = useTables();

    return (
        <div className="h-full p-8 overflow-y-auto bg-[#F3F5F7]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการโต๊ะ</h2>
                    <p className="text-gray-500 text-sm mt-1">ภาพรวมสถานะโต๊ะทั้งหมดในร้าน</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-[#DEE2E6] shadow-sm">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600">ว่าง ({tables.filter(t => t.status === 'available').length})</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-[#DEE2E6] shadow-sm">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600">ไม่ว่าง ({tables.filter(t => t.status === 'occupied').length})</span>
                    </div>
                </div>
            </header>

            {/* Order Types */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => onTableSelect('takeaway')}
                    className="flex items-center justify-center gap-3 p-6 bg-white border border-[#DEE2E6] rounded-xl hover:border-[#F96D01] hover:bg-[#FFF8F3] transition-all group shadow-sm"
                >
                    <div className="w-12 h-12 bg-white border border-[#DEE2E6] rounded-full flex items-center justify-center text-[#F96D01] group-hover:border-[#F96D01] transition-colors">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800">สั่งกลับบ้าน</h3>
                        <p className="text-xs text-gray-400">Takeaway Order</p>
                    </div>
                </button>
                <button
                    onClick={() => onTableSelect('lineman')}
                    className="flex items-center justify-center gap-3 p-6 bg-white border border-[#DEE2E6] rounded-xl hover:border-[#00B150] hover:bg-[#F6FFF9] transition-all group shadow-sm"
                >
                    <div className="w-12 h-12 bg-white border border-[#DEE2E6] rounded-full flex items-center justify-center text-[#00B150] group-hover:border-[#00B150] transition-colors">
                        <Bike size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800">Lineman / Delivery</h3>
                        <p className="text-xs text-gray-400">Online Delivery</p>
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => {
                    const isOccupied = table.status === 'occupied';
                    return (
                        <div
                            key={table.id}
                            onClick={() => onTableSelect(table.id)}
                            className={`
                relative h-40 rounded-xl p-5 cursor-pointer transition-all duration-200
                border shadow-sm flex flex-col justify-between group
                ${isOccupied
                                    ? 'bg-white border-red-200 hover:border-red-300 hover:shadow-md'
                                    : 'bg-white border-[#DEE2E6] hover:border-[#1277E3] hover:shadow-md'
                                }
              `}
                        >
                            {isOccupied && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-xl" />}

                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-medium mb-1">TABLE</span>
                                    <span className={`text-4xl font-bold ${isOccupied ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {table.name}
                                    </span>
                                </div>

                                {isOccupied ? (
                                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                        <AlertCircle size={18} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <CheckCircle size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                {isOccupied ? (
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">ยอดรวม</span>
                                            <span className="text-lg font-bold text-red-600">
                                                ฿{table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                            {new Date(table.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center font-medium group-hover:text-[#1277E3]">
                                        แตะเพื่อสั่งอาหาร
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
