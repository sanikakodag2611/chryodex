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
const today = new Date(); // 09:51 PM IST, September 25, 2025

export default function ProductWise() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {}, categories: [] });
  const [tableData, setTableData] = useState([]);
  const [products, setProducts] = useState([]); // New state for product list
  const [selectedProduct, setSelectedProduct] = useState(''); // New state for selected product
  const token = sessionStorage.getItem('auth_token');
  const tableRef = useRef(null);

  // Set initial date range to current month
  useEffect(() => {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDayOfMonth);
    setToDate(today);
  }, []);

  // Fetch data when dates or selected product change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchProducts(); // Fetch product list
      fetchChartData();
      fetchTableData();
    }
  }, [fromDate, toDate, selectedProduct]);

  const handleFromDateChange = (date) => {
    if (toDate && date > toDate) return;
    setFromDate(date);
    setSelectedProduct(''); // Reset selected product when date changes
  };

  const handleToDateChange = (date) => {
    if (fromDate && date < fromDate) return;
    setToDate(date);
    setSelectedProduct(''); // Reset selected product when date changes
  };

  const fetchProducts = async () => {
    try {
      const params = {
        from_date: format(fromDate, 'yyyy-MM-dd'),
        to_date: format(toDate, 'yyyy-MM-dd'),
      };
      const res = await axios.get('http://127.0.0.1:8000/api/product-details', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      const uniqueProducts = [...new Set(data.map((row) => row.product))].sort();
      setProducts(['All Products', ...uniqueProducts]); // Include "All Products" option
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(['All Products']);
    }
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const params = {
        from_date: format(fromDate, 'yyyy-MM-dd'),
        to_date: format(toDate, 'yyyy-MM-dd'),
      };
      if (selectedProduct && selectedProduct !== 'All Products') {
        params.product = selectedProduct; // Filter by selected product
      }
      const res = await axios.get('http://127.0.0.1:8000/api/product-wise', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];

      if (!data.length || (Array.isArray(data) && data[0].message)) {
        setChartData({ series: [], options: {}, categories: [] });
        return;
      }

      const productList = [...new Set(data.map((d) => d.product_name))].sort();
      const series = [
        {
          name: 'Sales',
          data: productList.map((p) =>
            Number(data.filter((x) => x.product_name === p).reduce((a, b) => a + (Number(b.sales) || 0), 0).toFixed(2))
          ),
        },
        {
          name: 'Profit',
          data: productList.map((p) =>
            Number(data.filter((x) => x.product_name === p).reduce((a, b) => a + (Number(b.profit) || 0), 0).toFixed(2))
          ),
        },
      ];
      const categories = productList;

      setChartData({
        series,
        categories,
        options: {
          chart: { type: 'bar', height: 400, stacked: true },
          plotOptions: { bar: { horizontal: false, columnWidth: '60%' } },
          xaxis: {
            categories,
            title: { text: 'Product', style: { fontWeight: 600, fontSize: '14px' } },
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
      console.error(err);
      setChartData({ series: [], options: {}, categories: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async () => {
    try {
      const params = {
        from_date: format(fromDate, 'yyyy-MM-dd'),
        to_date: format(toDate, 'yyyy-MM-dd'),
      };
      if (selectedProduct && selectedProduct !== 'All Products') {
        params.product = selectedProduct; // Filter by selected product
      }
      const res = await axios.get('http://127.0.0.1:8000/api/product-details', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      const mappedData = data.map((row) => ({
        ...row,
        product_name: row.product || 'N/A', // Map 'product' to 'product_name' for table rendering
      }));
      setTableData(mappedData);
    } catch (err) {
      console.error('Error fetching table data:', err);
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
        Product: row.product_name,
        Sales: formatCurrency(row.grand_total || row.net_amount || 0),
        Profit: formatCurrency(row.profit_amount || 0),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProductWiseReport');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `ProductWiseReport_${format(today, 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>Product Wise Report</title>
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
            <h2>Cryodex Construction chemical PVT.LTD</h2>
            <h2>Product Wise Report</h2>
            <p>Date: ${format(today, 'dd-MM-yyyy hh:mm a')} IST</p>
          </div>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContent;
  };

  return (
    <MainCard title="Product Wise Report">
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
          @media (max-width: 768px) {
            .filter-container { flex-direction: column; align-items: stretch; }
            .filter-container select, .filter-container input { width: 100%; max-width: 250px; }
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
            <h4 className="company-name">Cryodex Construction chemical PVT.LTD</h4>
            <p className="date-time">Date: {format(today, 'dd-MM-yyyy hh:mm a')} IST</p>
          </div>
          <div className="actions">
            <button onClick={handlePrint} style={{ padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4 }}>
              Print
            </button>
            <button onClick={exportToExcel} style={{ padding: '5px 10px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 4 }}>
              Export to Excel
            </button>
          </div>
        </div>
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
          <div>
            <label>Product: </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ padding: '5px', borderRadius: 4, border: '1px solid #ccc' }}
            >
              {products.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
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
          <h3 style={{ textAlign: 'center' }}>Product Wise Details</h3>
          <table style={{ border: '1px solid #ccc' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Product</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Sales (₹)</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Profit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>
                      {row.product_name || 'N/A'}
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