import React from 'react';
import { Plus } from 'lucide-react';

export function ProductCard({ product, onAddToCart }) {
    return (
        <button
            className="group flex flex-col justify-between p-4 h-[120px] bg-white rounded-lg border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-[#1277E3]/30 hover:-translate-y-0.5 transition-all duration-200 text-left relative overflow-hidden"
            onClick={() => onAddToCart(product)}
        >
            {/* Category Strip */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1277E3] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-full pl-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-[#1277E3] transition-colors">
                    {product.name}
                </h3>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    {product.category}
                </span>
            </div>

            <div className="w-full flex items-end justify-between pl-2">
                <span className="text-base font-bold text-gray-900">฿{product.price}</span>
                <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#1277E3] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <Plus size={16} strokeWidth={3} />
                </div>
            </div>
        </button>
    );
}
