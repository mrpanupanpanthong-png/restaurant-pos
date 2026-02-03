import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { POSLayout } from './components/pos/POSLayout';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { ExpenseTracker } from './components/expenses/ExpenseTracker';
import { MenuManagement } from './components/menu/MenuManagement';
import { TableLayout } from './components/tables/TableLayout';
import { ProductProvider } from './context/ProductContext';
import { TableProvider, useTables } from './context/TableContext';
import { TransactionProvider } from './context/TransactionContext';

function AppContent() {
    const [activeTab, setActiveTab] = useState('tables');
    const { setActiveTableId } = useTables();

    const handleTableSelect = (tableId) => {
        setActiveTableId(tableId);
        setActiveTab('pos');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onViewAll={() => setActiveTab('transactions')} />;
            case 'tables':
                return <TableLayout onTableSelect={handleTableSelect} />;
            case 'pos':
                return <POSLayout onBack={() => setActiveTab('tables')} />;
            case 'transactions':
                return <TransactionHistory />;
            case 'expenses':
                return <ExpenseTracker />;
            case 'settings':
                return <MenuManagement />;
            default:
                return <TableLayout onTableSelect={handleTableSelect} />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f9fafb] text-gray-900 font-sans">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-hidden relative">
                {renderContent()}
            </main>
        </div>
    );
}

function App() {
    return (
        <ProductProvider>
            <TableProvider>
                <TransactionProvider>
                    <AppContent />
                </TransactionProvider>
            </TableProvider>
        </ProductProvider>
    )
}

export default App;
