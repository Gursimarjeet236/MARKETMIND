import React from 'react';
import TradingViewWidget from '@/components/common/TradingViewWidget';

export default function TradingViewChart({ symbol, theme }) {
    return (
        <div className="w-full h-full bg-card rounded-lg overflow-hidden border">
            <TradingViewWidget symbol={symbol} theme={theme} autosize={true} />
        </div>
    );
}
