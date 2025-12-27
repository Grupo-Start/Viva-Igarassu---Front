import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './VisitsChart.css';

const defaultData = [];

export function EventsChart({ data = defaultData }) {
  return (
    <div className="visits-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="data" 
            tickFormatter={(value) => {
              if (!value) return '';
              const [year, month, day] = value.split('-');
              return `${day}/${month}`;
            }}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => {
              if (!value) return '';
              const [year, month, day] = value.split('-');
              return `${day}/${month}/${year}`;
            }}
          />
          <Legend formatter={() => 'Eventos'} />
          <Line 
            type="monotone" 
            dataKey="total_eventos" 
            stroke="#0A84FF" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
