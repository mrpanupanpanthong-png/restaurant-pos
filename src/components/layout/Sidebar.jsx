import React from 'react';
import { LayoutGrid, UtensilsCrossed, ShoppingBag, Receipt, Settings, Menu } from 'lucide-react';

export function Sidebar({ activeTab, onTabChange }) {
    const navItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'ภาพรวม' },
        { id: 'tables', icon: UtensilsCrossed, label: 'โต๊ะ' },
        { id: 'transactions', icon: Receipt, label: 'บิล' },
        { id: 'settings', icon: Settings, label: 'ตั้งค่า' },
    ];

    return (
        <aside className="w-24 bg-white border-r border-[#DEE2E6] flex flex-col items-center h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {/* Brand Logo */}
            <div className="h-24 w-full flex flex-col items-center justify-center border-b border-[#F0F2F5] gap-1">
                <div className="w-12 h-12 bg-[#1277E3] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                    สุข
                </div>
                <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px]">เมืองปทุม</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full flex flex-col items-center gap-2 py-6">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 gap-1
                ${isActive
                                    ? 'bg-[#EAF4FF] text-[#1277E3]'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Status */}
            <div className="pb-6">
                <div className={`w-3 h-3 rounded-full ${true ? 'bg-green-500' : 'bg-gray-300'} ring-4 ring-white shadow-sm`}></div>
            </div>
        </aside>
    );
}
