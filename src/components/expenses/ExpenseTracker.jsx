import React from 'react';
import { PlusCircle } from 'lucide-react';

export function ExpenseTracker() {
    const expenses = [
        { id: 1, title: 'Vegetables Request', amount: 450, date: 'Today' },
        { id: 2, title: 'Electricity Bill', amount: 2500, date: 'Yesterday' },
    ];

    return (
        <div className="h-full p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Expenses</h2>
                    <p className="text-muted-foreground">Track daily costs and overheads.</p>
                </div>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/25 flex items-center gap-2">
                    <PlusCircle size={18} />
                    Add Expense
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.map(e => (
                    <div key={e.id} className="p-6 bg-card border border-white/5 rounded-2xl flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{e.title}</h3>
                            <p className="text-sm text-muted-foreground">{e.date}</p>
                        </div>
                        <p className="text-xl font-bold text-red-400">-฿{e.amount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
