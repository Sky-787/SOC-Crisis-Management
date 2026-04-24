import React from 'react';
import { 
  BarChart as ReChartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const BarChart = ({ data, xKey, yKey, title, color = "#3b82f6" }) => {
  return (
    <div className="w-full h-64 bg-gray-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
      {title && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsBar data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="#9ca3af" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
        </ReChartsBar>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
