import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Chart.css';

const defaultData = [
  { mes: 'Jan', visitas: 400 },
  { mes: 'Fev', visitas: 300 },
  { mes: 'Mar', visitas: 600 },
  { mes: 'Abr', visitas: 800 },
  { mes: 'Mai', visitas: 500 },
  { mes: 'Jun', visitas: 900 },
  { mes: 'Jul', visitas: 1200 },
  { mes: 'Ago', visitas: 1100 },
  { mes: 'Set', visitas: 950 },
  { mes: 'Out', visitas: 1300 },
  { mes: 'Nov', visitas: 1400 },
  { mes: 'Dez', visitas: 1600 },
];

export function VisitsChart({ data = defaultData }) {
  return (
    <div className="visits-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="data" 
            tickFormatter={(value) => {
              const [year, month, day] = value.split('-');
              return `${day}/${month}`;
            }}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => {
              const [year, month, day] = value.split('-');
              return `${day}/${month}/${year}`;
            }}
          />
          <Legend formatter={() => 'Visitas'} />
          <Line 
            type="monotone" 
            dataKey="total_visitas" 
            stroke="#46c7c2" 
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
