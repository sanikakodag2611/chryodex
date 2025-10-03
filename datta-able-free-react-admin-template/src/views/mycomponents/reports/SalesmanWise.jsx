import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import MainCard from 'components/MainCard';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const formatDate = (d) => (d ? format(new Date(d), 'dd-MM-yyyy') : '');
const today = new Date(); // Current date: 07:27 AM IST, October 01, 2025

export default function SalesmanWise() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {}, categories: [] });
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem('auth_token');
  const tableRef = useRef(null);

  // Set initial date range to current month
  useEffect(() => {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDayOfMonth);
    setToDate(today);
  }, []);

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchChartData();
      fetchTableData();
    }
  }, [fromDate, toDate]);

  const handleFromDateChange = (date) => {
    if (toDate && date > toDate) return;
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    if (fromDate && date < fromDate) return;
    setToDate(date);
  };

  const fetchChartData = async () => {
    if (!token) {
      setError('No authentication token found. Please log in.');
      setChartData({ series: [], options: {}, categories: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = {
        from_date: format(fromDate, 'yyyy-MM-dd'),
        to_date: format(toDate, 'yyyy-MM-dd'),
      };
      const res = await axios.get('http://127.0.0.1:8000/api/salesman-wise', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];

      console.log('Chart API Response:', data); // Debug: Log raw API response

      if (!data.length || data.message) {
        console.warn('No data or message received:', data.message || 'Empty response');
        setChartData({ series: [], options: {}, categories: [] });
        return;
      }

      // Use 'salesman' field from backend instead of 'salesman_name'
      const salesmanList = [...new Set(data.map((d) => d.salesman))].sort();
      const series = [
        {
          name: 'Sales',
          data: salesmanList.map((name) =>
            Number(
              data
                .filter((x) => x.salesman === name)
                .reduce((a, b) => a + (Number(b.sales) || 0), 0)
                .toFixed(2)
            )
          ),
        },
        {
          name: 'Profit',
          data: salesmanList.map((name) =>
            Number(
              data
                .filter((x) => x.salesman === name)
                .reduce((a, b) => a + (Number(b.profit) || 0), 0)
                .toFixed(2)
            )
          ),
        },
      ];

      console.log('Chart Series:', series); // Debug: Log processed series data

      const categories = salesmanList.map((name) => name || 'Unknown');

      setChartData({
        series,
        categories,
        options: {
          chart: { type: 'bar', height: 400, stacked: true },
          plotOptions: { bar: { horizontal: false, columnWidth: '60%' } },
          xaxis: {
            categories,
            title: { text: 'Salesman', style: { fontWeight: 600, fontSize: '14px' } },
            labels: {
              rotate: -45,
              hideOverlappingLabels: true,
              trim: true,
              minHeight: 70,
              style: { fontSize: '10px', fontWeight: 600 },
            },
          },
          yaxis: {
            min: 0,
            forceNiceScale: true,
            title: { text: 'Amount (₹)', style: { fontWeight: 600, fontSize: '13px' } },
            labels: { formatter: (val) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
          },
          colors: ['#3498db', '#2ecc71'],
          dataLabels: {
            enabled: true,
            formatter: (val) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          },
          legend: { position: 'top', horizontalAlign: 'center' },
          grid: { padding: { bottom: 50 } },
        },
      });
    } catch (err) {
      console.error('Error fetching chart data:', err.response?.data || err.message);
      setError('Failed to fetch chart data. Please try again.');
      setChartData({ series: [], options: {}, categories: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async () => {
    if (!token) {
      setError('No authentication token found. Please log in.');
      setTableData([]);
      return;
    }

    try {
      const params = {
        from_date: format(fromDate, 'yyyy-MM-dd'),
        to_date: format(toDate, 'yyyy-MM-dd'),
      };
      const res = await axios.get('http://127.0.0.1:8000/api/salesman-details', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Table API Response:', res.data); // Debug: Log table data
      setTableData(res.data || []);
    } catch (err) {
      console.error('Error fetching table data:', err.response?.data || err.message);
      setError('Failed to fetch table data. Please try again.');
      setTableData([]);
    }
  };

  // Calculate totals
  const totalSales = chartData.series[0]?.data?.reduce((sum, val) => sum + (Number(val) || 0), 0) || 0;
  const totalProfit = chartData.series[1]?.data?.reduce((sum, val) => sum + (Number(val) || 0), 0) || 0;

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      tableData.map((row) => ({
        Salesman: row.salesman_name,
        Sales: formatCurrency(row.grand_total || row.net_amount || 0),
        Profit: formatCurrency(row.profit_amount || 0),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesmanWiseReport');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `SalesmanWiseReport_${format(today, 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>Salesman Wise Report</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 5px; text-align: center; }
            th { background-color: #f0f0f0; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 200px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/src/assets/images/logo-cryo.jpeg" alt="Company Logo" class="logo" />
            <h2>Cryodex Construction Chemical PVT.LTD</h2>
            <h2>Salesman Wise Report</h2>
            <p>Date: ${format(today, 'dd-MM-yyyy hh:mm a')}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Restore React state after print
  };

  return (
    <MainCard title="Salesman Wise Report">
      <style>
        {`
          .scroll-container { width: 100%; overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; min-width: 800px; }
          .chart-container { min-width: 600px; }
          .filter-container {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 10px;
            align-items: center;
          }
          .header-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 0 10px;
            width: 100%;
          }
          .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
          }
          .company-name {
            margin: 5px 0;
            font-size: 1.2rem;
            font-weight: bold;
          }
          .date-time {
            margin: 5px 0;
            font-size: 1rem;
          }
          .logo { max-width: 150px; }
          .actions { display: flex; gap: 10px; }
          .error-message { color: red; text-align: center; margin: 10px 0; }
          @media (max-width: 768px) {
            .filter-container { flex-direction: column; align-items: stretch; }
            .filter-container input { width: 100%; max-width: 250px; }
            .header-section {
              flex-direction: column;
              text-align: center;
            }
            .header-content { width: 100%; }
            .actions { justify-content: center; margin-top: 10px; }
          }
        `}
      </style>
      <div className="scroll-container">
        <div className="header-section">
          <div className="header-content">
            <img src="/src/assets/images/logo-cryo.jpeg" alt="Company Logo" className="logo" />
            <h4 className="company-name">Cryodex Construction Chemical PVT.LTD</h4>
            <p className="date-time">Date: {format(today, 'dd-MM-yyyy hh:mm a')}</p>
            <p className="date-time">Salesman Wise Sales Report</p>
          </div>
          <div className="actions">
            <button
              onClick={handlePrint}
              style={{ padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Print
            </button>
            <button
              onClick={exportToExcel}
              style={{ padding: '5px 10px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Export to Excel
            </button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="filter-container">
          <div>
            <label>From: </label>
            <DatePicker
              selected={fromDate}
              onChange={handleFromDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select From Date"
            />
          </div>
          <div>
            <label>To: </label>
            <DatePicker
              selected={toDate}
              onChange={handleToDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select To Date"
              minDate={fromDate}
            />
          </div>
        </div>

        <div className="chart-container" style={{ marginBottom: '20px', padding: '0 10px' }}>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading chart...</p>
          ) : !chartData.series.length ? (
            <p style={{ textAlign: 'center', marginTop: 80, fontSize: '16px', color: '#888' }}>
              No data found for selected range.
            </p>
          ) : (
            <Chart options={chartData.options} series={chartData.series} type="bar" height={400} />
          )}
        </div>

        <div style={{ padding: '0 10px' }} ref={tableRef}>
          <h3 style={{ textAlign: 'center' }}>Salesman Details</h3>
          <table style={{ border: '1px solid #ccc' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Salesman</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Sales (₹)</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Profit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>
                      {row.salesman_name}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>
                      {formatCurrency(row.grand_total || row.net_amount || 0)}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>
                      {formatCurrency(row.profit_amount || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#e0e0f0', fontWeight: 600 }}>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>Total</td>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(totalSales)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(totalProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </MainCard>
  );
}