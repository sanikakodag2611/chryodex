import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { day: '2025-09-15', sales: 4000, profit: 800 },
  { day: '2025-09-16', sales: 3000, profit: 600 },
  { day: '2025-09-17', sales: 5000, profit: 1000 },
  { day: '2025-09-18', sales: 2000, profit: 400 },
];

const pieData = [
  { name: 'Product A', value: 30 },
  { name: 'Product B', value: 20 },
  { name: 'Product C', value: 25 },
  { name: 'Product D', value: 25 },
];

const salesTableData = [
  { id: 1, purchaser: 'Purchaser 1 (INV001)', customer: 'ABC Construction Ltd', date: '2025-09-15', product: 'Product X', baseCost: 5000, commission: 1000, netProfit: 2000, profit: 1500, gst: 300, total: 6800 },
  { id: 2, purchaser: 'Purchaser 2 (INV002)', customer: 'XYZ Enterprises', date: '2025-09-16', product: 'Product Y', baseCost: 7500, commission: 1500, netProfit: 3000, profit: 2250, gst: 450, total: 10200 },
  { id: 3, purchaser: 'Purchaser 3 (INV003)', customer: 'PQR Corp', date: '2025-09-17', product: 'Product Z', baseCost: 4000, commission: 800, netProfit: 1600, profit: 1200, gst: 240, total: 5440 },
];

function new1() {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f7f7f7' }}>
      {/* Sidebar */}
      <aside style={{ width: '256px', backgroundColor: '#28a745', color: 'white', padding: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>CSC CHRYODEX</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '8px' }}>Dashboard</li>
          <li style={{ marginBottom: '8px' }}>Authentication</li>
          <li style={{ marginBottom: '8px' }}>Company Management</li>
          <li style={{ marginBottom: '8px' }}>Employee Management</li>
          <li style={{ marginBottom: '8px' }}>Product Management</li>
          <li style={{ marginBottom: '8px' }}>Sales Management</li>
          <li style={{ marginBottom: '8px' }}>Invoice Management</li>
          <li style={{ marginBottom: '8px' }}>Task Management</li>
          <li style={{ marginBottom: '8px' }}>Content Management</li>
          <li style={{ marginBottom: '8px' }}>Country Portal</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px' }}>
        {/* Top Bar */}
        <header style={{ backgroundColor: '#28a745', color: 'white', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px' }}>Welcome | CHRYODEX</h1>
          <input
            type="text"
            placeholder="Search..."
            style={{ padding: '8px', borderRadius: '4px', border: 'none' }}
          />
        </header>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#718096' }}>Daily Performance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹0</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#718096' }}>Monthly Performance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹1,00,44,53</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#718096' }}>Yearly Performance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹13,40,04,53</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#718096' }}>Fruit</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹0</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ color: '#718096' }}>Loss</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹0</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Profile Analysis Dashboard</h3>
            <BarChart width={500} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
            </BarChart>
          </div>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Date wise Profit</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Detailed Sales Data</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0' }}>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Sr No</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Purchaser Name (Invoice)</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Customer</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Date</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Product</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Base Cost</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Commission</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Net Profit</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Profit %</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>GST</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {salesTableData.map((row) => (
                <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{row.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{row.purchaser}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{row.customer}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{row.date}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{row.product}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{row.baseCost.toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{row.commission.toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{row.netProfit.toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{(row.profit / row.baseCost * 100).toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{row.gst.toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{row.total.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#edf2f7', fontWeight: 'bold' }}>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} colSpan="5">Total</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{salesTableData.reduce((sum, row) => sum + row.baseCost, 0).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{salesTableData.reduce((sum, row) => sum + row.commission, 0).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{salesTableData.reduce((sum, row) => sum + row.netProfit, 0).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}></td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{salesTableData.reduce((sum, row) => sum + row.gst, 0).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>₹{salesTableData.reduce((sum, row) => sum + row.total, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default new1;