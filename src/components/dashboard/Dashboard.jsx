import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { TrendingUp, ShoppingBag, DollarSign, Users, Receipt } from 'lucide-react';

export function Dashboard({ onViewAll }) {
    const { transactions } = useTransactions();

    // Calculate Today's Stats
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === today);

    const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = todayTransactions.length;

    // Previous day for trend (MOCK for now, but scalable)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === yesterday.toDateString());
    const yesterdaySales = yesterdayTransactions.reduce((sum, t) => sum + t.total, 0);

    const salesTrend = yesterdaySales === 0 ? '+100%' : `${(((totalSales - yesterdaySales) / yesterdaySales) * 100).toFixed(0)}%`;

    return (
        <div className="h-full p-8 overflow-y-auto bg-[#F3F5F7]">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h2>
                    <p className="text-gray-500">สรุปภาพรวมการขายประจำวันนี้</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600">ระบบทำงานปกติ</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="ยอดขายวันนี้"
                    value={`฿${totalSales.toLocaleString()}`}
                    trend={salesTrend}
                    icon={<DollarSign className="text-blue-600" size={20} />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="จำนวนออเดอร์"
                    value={totalOrders}
                    trend={`+${Math.round(totalOrders * 0.5)}%`}
                    icon={<ShoppingBag className="text-orange-600" size={20} />}
                    color="bg-orange-50"
                />
                <StatCard
                    title="ลูกค้าวันนี้"
                    value={Math.round(totalOrders * 1.2)}
                    trend="+5%"
                    icon={<Users className="text-green-600" size={20} />}
                    color="bg-green-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions Simple List */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-lg">รายการล่าสุด</h3>
                        <button
                            onClick={onViewAll}
                            className="text-[#1277E3] text-sm font-semibold hover:underline"
                        >
                            ดูทั้งหมด
                        </button>
                    </div>
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                        <Receipt size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">
                                            {t.orderChannel} {t.tableId && typeof t.tableId === 'number' ? `#${t.tableId}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-800">฿{t.total.toLocaleString()}</span>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <p className="text-center py-8 text-gray-400 text-sm italic">ยังไม่มีรายการชำระเงินในวันนี้</p>
                        )}
                    </div>
                </div>

                {/* Weekly Sales Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg mb-6">สรุปรายรับ 7 วันล่าสุด</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] pt-4">
                        {(() => {
                            const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

                            // Calculate the Monday of the current week
                            const now = new Date();
                            const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
                            // If today is Sun (0), we go back 6 days to get Mon. 
                            // Otherwise, go back (currentDay - 1) days.
                            const diff = currentDay === 0 ? -6 : 1 - currentDay;
                            const monday = new Date(now);
                            monday.setDate(now.getDate() + diff);

                            const weekDays = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date(monday);
                                d.setDate(monday.getDate() + i);
                                return d;
                            });

                            const dailyTotals = weekDays.map(date => {
                                const dateStr = date.toDateString();
                                const dayTotal = transactions
                                    .filter(t => new Date(t.timestamp).toDateString() === dateStr)
                                    .reduce((sum, t) => sum + t.total, 0);
                                return {
                                    dayName: days[date.getDay()],
                                    total: dayTotal,
                                    isToday: dateStr === today
                                };
                            });

                            const maxVal = Math.max(...dailyTotals.map(d => d.total), 1);

                            return dailyTotals.map((data, i) => {
                                const barHeight = (data.total / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex justify-center items-end h-40">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                                ฿{data.total.toLocaleString()}
                                            </div>
                                            <div
                                                className={`w-full max-w-[32px] rounded-t-lg transition-all duration-700 ease-out ${data.isToday ? 'bg-[#1277E3]' : 'bg-blue-100 group-hover:bg-blue-200'}`}
                                                style={{ height: `${barHeight}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold ${data.isToday ? 'text-[#1277E3]' : 'text-gray-400'}`}>
                                            {data.dayName}
                                        </span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Sales Channel Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-lg mb-6">ช่องทางการขาย</h3>
                    <div className="space-y-5">
                        {totalOrders > 0 ? (
                            <>
                                {(() => {
                                    const channelCounts = todayTransactions.reduce((acc, t) => {
                                        let channel = t.order_channel || 'อื่นๆ';

                                        // Group all tables into "ทานที่ร้าน"
                                        if (channel.startsWith('โต๊ะ')) {
                                            channel = 'ทานที่ร้าน';
                                        }

                                        acc[channel] = (acc[channel] || 0) + 1;
                                        return acc;
                                    }, {});

                                    return Object.entries(channelCounts)
                                        .sort((a, b) => b[1] - a[1]) // highest first
                                        .map(([name, count]) => {
                                            const percent = Math.round((count / totalOrders) * 100);
                                            let color = "bg-blue-500";
                                            if (name === 'กลับบ้าน') color = "bg-orange-500";
                                            if (name === 'Lineman') color = "bg-green-500";
                                            if (name === 'อื่นๆ') color = "bg-gray-400";

                                            return <ChannelProgress key={name} name={name} color={color} percent={percent} />;
                                        });
                                })()}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                <TrendingUp size={48} strokeWidth={1} />
                                <p className="mt-2 font-medium text-sm">ยังไม่มีข้อมูลช่องทางการขาย</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }) {
    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <span className="text-3xl font-bold text-gray-800">{value}</span>
        </div>
    );
}

function ChannelProgress({ name, color, percent }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">{name}</span>
                <span className="text-gray-800 font-bold">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
}
