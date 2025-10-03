// import React, { useState } from 'react';
// import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
// import axios from 'axios';
// import MainCard from 'components/MainCard';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import {
//   PieChart as RechartsPieChart,
//   Pie,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Cell,
// } from 'recharts';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// function PieChart() {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
//   const [selectedMetric, setSelectedMetric] = useState('revenue');

//   const fetchChartData = async () => {
//     if (!fromDate || !toDate) {
//       setAlert({
//         show: true,
//         message: 'Please select both From and To dates.',
//         variant: 'danger',
//       });
//       return;
//     }

//     try {
//       setLoading(true);
//       setAlert({ show: false, message: '', variant: '' });
//       const apiFrom = format(fromDate, 'yyyy-MM-dd');
//       const apiTo = format(toDate, 'yyyy-MM-dd');

//       const res = await axios.get(
//         `http://127.0.0.1:8000/api/profit-chart?from_date=${apiFrom}&to_date=${apiTo}`
//       );

//       if (res.data.length === 0) {
//         setData([]);
//       } else {
//         // Aggregate data for pie chart
//         const aggregatedData = [
//           {
//             name: 'Revenue',
//             value: res.data.reduce((sum, item) => sum + parseFloat(item.revenue), 0),
//           },
//           {
//             name: 'Profit',
//             value: res.data.reduce((sum, item) => sum + parseFloat(item.profit), 0),
//           },
//           {
//             name: 'Cost',
//             value: res.data.reduce((sum, item) => sum + parseFloat(item.cost), 0),
//           },
//         ].filter(item => item.value > 0); // Filter out zero values
//         setData(aggregatedData);
//       }
//     } catch (error) {
//       console.error('Error fetching chart data:', error);
//       setAlert({
//         show: true,
//         message: error.response?.data?.message || 'Failed to fetch chart data.',
//         variant: 'danger',
//       });
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Colors for pie slices
//   const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

//   return (
//     <MainCard title="Profit Analysis Pie Chart">
//       {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
//       <Form className="mb-3">
//         <Row className="align-items-end">
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>From Date</Form.Label>
//               <DatePicker
//                 selected={fromDate}
//                 onChange={(date) => {
//                   setFromDate(date);
//                   if (toDate && date > toDate) {
//                     setToDate(null);
//                   }
//                   setAlert({ show: false, message: '', variant: '' });
//                 }}
//                 dateFormat="dd-MM-yyyy"
//                 className="form-control"
//                 placeholderText="DD-MM-YYYY"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>To Date</Form.Label>
//               <DatePicker
//                 selected={toDate}
//                 onChange={(date) => {
//                   setToDate(date);
//                   setAlert({ show: false, message: '', variant: '' });
//                 }}
//                 dateFormat="dd-MM-yyyy"
//                 className="form-control"
//                 placeholderText="DD-MM-YYYY"
//                 minDate={fromDate}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Select Metric</Form.Label>
//               <Form.Select
//                 value={selectedMetric}
//                 onChange={(e) => setSelectedMetric(e.target.value)}
//               >
//                 <option value="revenue">Revenue</option>
//                 <option value="profit">Profit</option>
//                 <option value="cost">Cost</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={3}>
//             <Button
//               variant="primary"
//               onClick={fetchChartData}
//               disabled={loading}
//             >
//               {loading ? 'Fetching...' : 'Fetch Chart'}
//             </Button>
//           </Col>
//         </Row>
//       </Form>

//       <div style={{ width: '100%', height: 400 }}>
//         {loading ? (
//           <Alert variant="info" className="text-center">
//             Loading chart...
//           </Alert>
//         ) : data.length === 0 ? (
//           <Alert
//             variant="warning"
//             className="text-center"
//             style={{ marginTop: '180px', fontSize: '18px' }}
//           >
//             No Data Found
//           </Alert>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <RechartsPieChart>
//               <Pie
//                 data={data.filter(item => item.name.toLowerCase() === selectedMetric || selectedMetric === 'all')}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={150}
//                 label
//               >
//                 {data.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </RechartsPieChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </MainCard>
//   );
// }

// export default PieChart;

import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import MainCard from "components/MainCard";

export default function PieChart() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [totals, setTotals] = useState({ sales: 0, profit: 0 });

  const [groupBySalesman, setGroupBySalesman] = useState(false);
  const [groupByCity, setGroupByCity] = useState(false);
  const [drillDownCity, setDrillDownCity] = useState(null);
  const [drillDownSalesman, setDrillDownSalesman] = useState(null);

  const [activeToggles, setActiveToggles] = useState({ Sales: true, Profit: true });

  // Default date range: first day of month → today
  useEffect(() => {
    const today = new Date();
    setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setToDate(today);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchChartData();
      fetchTotals();
    }
  }, [fromDate, toDate, groupBySalesman, groupByCity, drillDownCity, drillDownSalesman, activeToggles]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const params = {
        from_date: format(fromDate, "yyyy-MM-dd"),
        to_date: format(toDate, "yyyy-MM-dd"),
      };

      let endpoint = "/api/date-wise";

      if (drillDownSalesman && drillDownCity) {
        endpoint = "/api/city-salesman-dates";
        params.city = drillDownCity;
        params.salesman = drillDownSalesman;
      } else if (drillDownCity && groupByCity) {
        endpoint = "/api/city-salesman";
        params.city = drillDownCity;
      } else if (drillDownSalesman && groupBySalesman) {
        endpoint = "/api/salesman-city";
        params.salesman = drillDownSalesman;
      } else if (groupByCity) {
        endpoint = "/api/city-wise";
      } else if (groupBySalesman) {
        endpoint = "/api/salesman-wise";
      }

      const token = sessionStorage.getItem("auth_token");

      const res = await axios.get(`http://127.0.0.1:8000${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`, // 🔑 attach token
        },
      });

      const data = res.data || [];

      if (!data.length) {
        setChartData({ series: [], labels: [] });
        return;
      }

      let categories = [];
      if (drillDownCity && groupByCity) categories = [...new Set(data.map(d => d.salesman))];
      else if (drillDownSalesman && groupBySalesman) categories = [...new Set(data.map(d => d.city))];
      else if (groupByCity) categories = [...new Set(data.map(d => d.city))];
      else if (groupBySalesman) categories = [...new Set(data.map(d => d.salesman))];
      else categories = [...new Set(data.map(d => d.date))];

      const series = [];
      const labels = [];

      categories.forEach(cat => {
        const rows = data.filter(d => d.city === cat || d.salesman === cat || d.date === cat);

        if (activeToggles.Sales) {
          const val = rows.reduce((sum, r) => sum + (r.sales ?? 0), 0);
          if (val > 0) {
            series.push(val);
            labels.push(`${cat} - Sales`);
          }
        }

        if (activeToggles.Profit) {
          const val = rows.reduce((sum, r) => sum + (r.profit ?? 0), 0);
          if (val > 0) {
            series.push(val);
            labels.push(`${cat} - Profit`);
          }
        }
      });

      setChartData({ series, labels });
    } catch (err) {
      console.error("Chart fetch error:", err);
      setChartData({ series: [], labels: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotals = async () => {
    try {
      const params = {
        from_date: format(fromDate, "yyyy-MM-dd"),
        to_date: format(toDate, "yyyy-MM-dd"),
        toggles: Object.keys(activeToggles).filter(k => activeToggles[k]),
      };
      if (drillDownCity && groupByCity) params.city = drillDownCity;
      if (drillDownSalesman && groupBySalesman) params.salesman = drillDownSalesman;

      const res = await axios.get("http://127.0.0.1:8000/api/totals", { params });
      setTotals(res.data);
    } catch (err) {
      console.error("Totals fetch error:", err);
      setTotals({ sales: 0, profit: 0 });
    }
  };

  const toggleHandler = key => setActiveToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const generateColors = count => Array.from({ length: count }, (_, i) => `hsl(${Math.floor((360 / count) * i)}, 70%, 50%)`);

  const extractNameFromLabel = label => {
    const m = label?.match(/^(.*?)\s-\s(Sales|Profit)$/);
    return m ? m[1] : label;
  };

  const onSliceClick = idx => {
    const clicked = chartData.labels[idx];
    const name = extractNameFromLabel(clicked);
    if (groupByCity && !drillDownCity) setDrillDownCity(name);
    else if (groupBySalesman && !drillDownSalesman) setDrillDownSalesman(name);
  };

  const backFromDrill = () => {
    setDrillDownCity(null);
    setDrillDownSalesman(null);
  };

  const getChartInfoLabel = () => {
    if (drillDownCity && groupByCity) return `Salesman-wise distribution in ${drillDownCity}`;
    if (groupByCity) return "City-wise Sales/Profit distribution";
    if (drillDownSalesman && groupBySalesman) return `City-wise distribution for ${drillDownSalesman}`;
    if (groupBySalesman) return "Salesman-wise Sales/Profit distribution";
    return "Date-wise Sales/Profit distribution";
  };

  return (
    <MainCard title="Pie Chart Analysis">
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <DatePicker selected={fromDate} onChange={date => { setFromDate(date); if(toDate && date>toDate) setToDate(null); }} dateFormat="dd-MM-yyyy" />
        <DatePicker selected={toDate} onChange={setToDate} dateFormat="dd-MM-yyyy" minDate={fromDate} />

        <button onClick={() => { setGroupBySalesman(!groupBySalesman); if(!groupBySalesman) setGroupByCity(false); backFromDrill(); }}
          style={{ backgroundColor: groupBySalesman?"#1E90FF":"#ccc", color:"#fff", padding:"6px 12px", border:"none", borderRadius:4, cursor:"pointer" }}>Salesman</button>

        <button onClick={() => { setGroupByCity(!groupByCity); if(!groupByCity) setGroupBySalesman(false); backFromDrill(); }}
          style={{ backgroundColor: groupByCity?"#1E90FF":"#ccc", color:"#fff", padding:"6px 12px", border:"none", borderRadius:4, cursor:"pointer" }}>City</button>

        {["Sales","Profit"].map(k => (
          <button key={k} onClick={()=>toggleHandler(k)}
            style={{
              padding:"6px 12px", marginLeft:5,
              backgroundColor: activeToggles[k] ? (k==="Sales"?"#1E90FF":"#32CD32"):"#ccc",
              color:"#fff", border:"none", borderRadius:4, cursor:"pointer"
            }}>{k}</button>
        ))}
      </div>

      {(drillDownCity || drillDownSalesman) && <button style={{marginBottom:10}} onClick={backFromDrill}>← Back</button>}

      <div style={{ display:"flex", gap:20, fontWeight:"bold", marginBottom:15 }}>
        {activeToggles.Sales && <div>Total Sales: ₹{(totals.sales||0).toLocaleString("en-IN")}</div>}
        {activeToggles.Profit && <div>Total Profit: ₹{(totals.profit||0).toLocaleString("en-IN")}</div>}
      </div>

      <div style={{ width:"100%", height:400 }}>
        {loading ? <p>Loading chart...</p> :
          chartData.series.length===0 ? <p style={{textAlign:"center", marginTop:100, fontSize:18, color:"#888"}}>No data found.</p> :
          <Chart
            options={{
              chart:{ type:"pie", events:{ dataPointSelection:(e,ctx,config)=> onSliceClick(config.dataPointIndex) }},
              labels: chartData.labels,
              colors: generateColors(chartData.series.length),
              legend:{ position:"right", fontSize:"14px" },
              tooltip:{ y:{ formatter: val=>`₹${Number(val).toLocaleString("en-IN")}` } },
              responsive: [{ breakpoint: 768, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }]
            }}
            series={chartData.series.map(v => Number(v) || 0)}
            type="pie"
            height="100%"
          />
        }
      </div>

      <div style={{ textAlign:"center", marginTop:12, fontSize:16, fontWeight:"bold" }}>
        {getChartInfoLabel()}
      </div>
    </MainCard>
  );
}
