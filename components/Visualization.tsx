import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartConfig, ChartDataPoint } from '../types';

interface VisualizationProps {
  data: ChartDataPoint[];
  config: ChartConfig;
}

export const Visualization: React.FC<VisualizationProps> = ({ data, config }) => {
  
  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
            <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            {config.dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={config.colors[index % config.colors.length]} 
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {config.dataKeys.map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.colors[index % config.colors.length]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={config.colors[index % config.colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
            />
            <Legend />
            {config.dataKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={config.colors[index % config.colors.length]} 
                fillOpacity={1} 
                fill={`url(#color${key})`} 
              />
            ))}
          </AreaChart>
        );
      case 'pie':
         // Pie charts handle data differently, assuming first dataKey is value
         const valueKey = config.dataKeys[0];
         return (
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey={valueKey}
                    nameKey={config.xAxisKey}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />
                    ))}
                </Pie>
                <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                />
                <Legend />
            </PieChart>
         );
      case 'bar':
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
            />
            <Legend />
            {config.dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={config.colors[index % config.colors.length]} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100">{config.title}</h3>
        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded uppercase">{config.type} Chart</span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
