import React from 'react';

export function Receipt({ transaction }) {
    if (!transaction) return null;

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

    return (
        <div className="receipt-print-container">
            <div className="receipt-container bg-white text-black font-['Kanit'] leading-tight border-none">
                {/* Store Info */}
                <div className="text-center mb-6 pt-4">
                    <h1 className="text-3xl font-black mb-1">สุข เมืองปทุม</h1>
                    <p className="text-sm font-medium opacity-70 italic">ต้นตำรับความอร่อย</p>
                    <div className="w-16 h-0.5 bg-black mx-auto mt-3 mb-2"></div>
                    <p className="text-base font-bold">ใบเสร็จรับเงินอย่างย่อ</p>
                </div>

                {/* Transaction info */}
                <div className="border-t border-b border-black py-3 mb-4 text-base">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold opacity-70">วันที่:</span>
                        <span className="font-medium">{formatDate(transaction.timestamp)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold opacity-70">เลขที่บิล:</span>
                        <span className="font-medium">#{transaction.id.toString().slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold opacity-70">ช่องทาง:</span>
                        <span className="font-black text-lg">
                            {transaction.orderChannel}
                        </span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="font-bold opacity-70">ชำระโดย:</span>
                        <span className="font-bold">{transaction.paymentMethod || 'เงินสด'}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                    <table className="w-full text-left text-base">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="py-2 font-black text-sm">รายการ</th>
                                <th className="py-2 text-center font-black text-sm">จำนวน</th>
                                <th className="py-2 text-right font-black text-sm">ราคา</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-[15px]">
                            {transaction.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 align-top leading-snug">
                                        <div>{item.name}</div>
                                        {item.note && <div className="text-[11px] italic opacity-60">({item.note})</div>}
                                    </td>
                                    <td className="py-2 text-center align-top">{item.quantity}</td>
                                    <td className="py-2 text-right align-top font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-t border-black pt-4 space-y-2">
                    <div className="flex justify-between text-base">
                        <span className="font-bold opacity-70">รวมเป็นเงิน</span>
                        <span className="font-bold">{transaction.subtotal.toLocaleString()}</span>
                    </div>
                    {transaction.discount > 0 && (
                        <div className="flex justify-between text-base text-red-600">
                            <span className="font-bold opacity-70">ส่วนลด</span>
                            <span className="font-bold">-{transaction.discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-black text-3xl pt-4 border-t border-dashed border-black">
                        <span>ยอดสุทธิ</span>
                        <span>฿{transaction.total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center border-t border-black pt-6 pb-6">
                    <p className="text-xl font-black mb-1">ขอบคุณที่ใช้บริการค่ะ</p>
                    <p className="text-sm font-medium opacity-60">โปรดรักษาใบเสร็จเพื่อประโยชน์ของท่าน</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700;900&display=swap');
                
                @media screen {
                    .receipt-print-container {
                        position: absolute;
                        left: -9999px;
                        top: -9999px;
                        visibility: hidden;
                    }
                }
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100%;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .receipt-print-container, .receipt-print-container * {
                        visibility: visible;
                        font-family: 'Kanit', sans-serif !important;
                    }
                    .receipt-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        display: block !important;
                    }
                    .receipt-container {
                        width: 100% !important;
                        padding: 8mm 6mm !important;
                        background: white !important;
                        color: black !important;
                    }
                }
            `}} />
        </div>
    );
}
