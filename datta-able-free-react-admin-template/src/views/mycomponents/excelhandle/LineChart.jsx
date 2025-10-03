
import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import MainCard from "components/MainCard";

export default function LineChart() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {}, categories: [] });

  const [groupBySalesman, setGroupBySalesman] = useState(false);
  const [groupByCity, setGroupByCity] = useState(false);

  const [drillDownCity, setDrillDownCity] = useState(null);
  const [drillDownSalesman, setDrillDownSalesman] = useState(null);
  const [drillPath, setDrillPath] = useState([]); // e.g. ["salesman", "city"]

  const token = sessionStorage.getItem("auth_token");

  // Default date range → current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay);
    setToDate(today);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) fetchChartData();
  }, [fromDate, toDate, groupBySalesman, groupByCity, drillDownCity, drillDownSalesman]);

  // -------------------------------
  // Fetch Data
  // -------------------------------
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

      const res = await axios.get(`http://127.0.0.1:8000${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || [];
      if (!data.length) {
        setChartData({ series: [], options: {}, categories: [] });
        return;
      }

      // -------------------------------
      // Build Series + Categories
      // -------------------------------
      let series = [];
      let categories = [];
      let xAxisLabel = "";

      const createSeriesForDates = (dataList) => {
        const dateList = [...new Set(dataList.map((d) => d.date))].sort(
          (a, b) => new Date(b) - new Date(a)
        );
        return {
          categories: dateList.map((d) => format(new Date(d), "dd-MM-yyyy")),
          series: [
            {
              name: "Sale",
              data: dateList.map((d) =>
                dataList.filter((x) => x.date === d).reduce((a, b) => a + b.sales, 0)
              ),
            },
            {
              name: "Profit",
              data: dateList.map((d) =>
                dataList.filter((x) => x.date === d).reduce((a, b) => a + b.profit, 0)
              ),
            },
          ],
        };
      };

      if (drillDownSalesman && drillDownCity) {
        const result = createSeriesForDates(data);
        categories = result.categories;
        series = result.series;
        xAxisLabel = `${drillDownSalesman} in ${drillDownCity} (Date-wise)`;
      } else if (drillDownSalesman && groupBySalesman) {
        categories = data.map((d) => d.city);
        series = [
          { name: "Sale", data: data.map((d) => d.sales) },
          { name: "Profit", data: data.map((d) => d.profit) },
        ];
        xAxisLabel = `Cities for ${drillDownSalesman}`;
      } else if (drillDownCity && groupByCity) {
        categories = data.map((d) => d.salesman);
        series = [
          { name: "Sale", data: data.map((d) => d.sales) },
          { name: "Profit", data: data.map((d) => d.profit) },
        ];
        xAxisLabel = `Salesmen in ${drillDownCity}`;
      } else if (groupBySalesman) {
        categories = data.map((d) => d.salesman);
        series = [
          { name: "Sale", data: data.map((d) => d.sales) },
          { name: "Profit", data: data.map((d) => d.profit) },
        ];
        xAxisLabel = "Salesman";
      } else if (groupByCity) {
        categories = data.map((d) => d.city);
        series = [
          { name: "Sale", data: data.map((d) => d.sales) },
          { name: "Profit", data: data.map((d) => d.profit) },
        ];
        xAxisLabel = "City";
      } else {
        const result = createSeriesForDates(data);
        categories = result.categories;
        series = result.series;
        xAxisLabel = "Date";
      }

      setChartData({
        series,
        categories,
        options: {
          chart: {
            type: "bar",
            stacked: true,
            height: 800,
            events: {
              dataPointSelection: (event, ctx, config) => {
                const clicked = categories[config.dataPointIndex];

                if (groupByCity && !drillDownCity) {
                  setDrillDownCity(clicked);
                  setDrillPath([...drillPath, "city"]);
                } else if (drillDownCity && groupByCity && !drillDownSalesman) {
                  setDrillDownSalesman(clicked);
                  setDrillPath([...drillPath, "salesman"]);
                } else if (groupBySalesman && !drillDownSalesman) {
                  setDrillDownSalesman(clicked);
                  setDrillPath([...drillPath, "salesman"]);
                } else if (drillDownSalesman && groupBySalesman && !drillDownCity) {
                  setDrillDownCity(clicked);
                  setDrillPath([...drillPath, "city"]);
                }
              },
            },
          },
          plotOptions: { bar: { horizontal: false, columnWidth: "70%" } },
          xaxis: {
            categories,
            title: { text: xAxisLabel, style: { fontWeight: 600, fontSize: "14px" } },
            labels: {
              rotate: -55,
              hideOverlappingLabels: true,
              style: { fontSize: "10px", fontWeight: 600 },
            },
          },
          grid: { padding: { bottom: 100 } },
          yaxis: {
            forceNiceScale: true,
            title: { text: "Amount (₹)", style: { fontWeight: 600, fontSize: "14px" } },
            labels: {
              formatter: (val) =>
                `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            },
          },
          colors: ["#3498db", "#2ecc71"],
          tooltip: {
            shared: false,
            y: {
              formatter: (val, { seriesIndex, w }) =>
                `${w.globals.seriesNames[seriesIndex]}: ₹${val.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`,
            },
          },
          dataLabels: {
            enabled: true,
            formatter: (val) =>
              `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          },
          legend: { position: "top" },
        },
      });
    } catch (err) {
      console.error(err);
      setChartData({ series: [], options: {}, categories: [] });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Handle Back Button
  // -------------------------------
  const handleBack = (index) => {
    const newPath = drillPath.slice(0, index);
    setDrillPath(newPath);

    if (!newPath.includes("city")) setDrillDownCity(null);
    if (!newPath.includes("salesman")) setDrillDownSalesman(null);
  };

  // -------------------------------
  // Pie Chart Data
  // -------------------------------
  const { pieSeries, pieLabels } = useMemo(() => {
    if (!chartData.series?.length || !chartData.series[1]?.data)
      return { pieSeries: [], pieLabels: [] };

    const profitData = chartData.series[1].data;
    const labels = chartData.categories || [];

    const cleanedSeries = profitData.map((val) => {
      const num = Number(val);
      return Number.isFinite(num) && num > 0 ? num : 0;
    });

    return { pieSeries: cleanedSeries, pieLabels: labels };
  }, [chartData]);

  const getPieChartTitle = () => {
    if (drillDownSalesman && drillDownCity)
      return `Date-wise Profit distribution for ${drillDownSalesman} in ${drillDownCity}`;
    if (drillDownCity && groupByCity)
      return `Salesman-wise Profit distribution in ${drillDownCity}`;
    if (drillDownSalesman && groupBySalesman)
      return `City-wise Profit distribution for ${drillDownSalesman}`;
    if (groupByCity) return "City-wise Profit distribution";
    if (groupBySalesman) return "Salesman-wise Profit distribution";
    return "Date-wise Profit distribution";
  };

  return (
    <MainCard title="Profit Analysis Chart">
      <div style={{ width: "100%", padding: "20px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label>From: </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date);
                if (toDate && date > toDate) setToDate(null);
              }}
              dateFormat="dd-MM-yyyy"
            />
          </div>
          <div>
            <label>To: </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              minDate={fromDate}
            />
          </div>
          <div>
            <label style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={groupBySalesman}
                onChange={(e) => {
                  setGroupBySalesman(e.target.checked);
                  if (e.target.checked) setGroupByCity(false);
                  setDrillDownCity(null);
                  setDrillDownSalesman(null);
                  setDrillPath([]);
                }}
              />{" "}
              Salesman
            </label>
            <label>
              <input
                type="checkbox"
                checked={groupByCity}
                onChange={(e) => {
                  setGroupByCity(e.target.checked);
                  if (e.target.checked) setGroupBySalesman(false);
                  setDrillDownCity(null);
                  setDrillDownSalesman(null);
                  setDrillPath([]);
                }}
              />{" "}
              City
            </label>
          </div>
        </div>

        {/* Back Buttons */}
        <div style={{ marginTop: "10px" }}>
          {drillPath.length > 0 &&
            drillPath.map((level, index) => (
              <button
                key={index}
                onClick={() => handleBack(index)}
                style={{ marginRight: "10px" }}
              >
                ← Back to {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
        </div>

        {/* Charts */}
        <div
          style={{
            width: "100%",
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {loading ? (
            <p>Loading chart...</p>
          ) : !chartData.series || chartData.series.length === 0 || pieSeries.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: 180, fontSize: "18px", color: "#888" }}>
              No data found for selected range.
            </p>
          ) : (
            <>
              <Chart options={chartData.options} series={chartData.series} type="bar" height={500} />
              <Chart
                type="pie"
                height={400}
                options={{
                  chart: { type: "pie" },
                  labels: pieLabels,
                  colors: Array.from({ length: pieSeries.length }, (_, i) => {
                    const hue = (i * 360) / pieSeries.length;
                    return `hsl(${hue}, 70%, 50%)`;
                  }),
                  title: {
                    text: getPieChartTitle(),
                    align: "center",
                    style: { fontWeight: 600, fontSize: "16px" },
                  },
                  legend: { position: "bottom" },
                  tooltip: {
                    y: {
                      formatter: (val) =>
                        `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                    },
                  },
                }}
                series={pieSeries}
              />
            </>
          )}
        </div>
      </div>
    </MainCard>
  );
}

// import React, { useState, useEffect, useMemo } from "react";
// import Chart from "react-apexcharts";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import { format } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";
// import MainCard from "components/MainCard";

// export default function LineChart() {
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [chartData, setChartData] = useState({ series: [], options: {}, categories: [] });
//   const [groupBySalesman, setGroupBySalesman] = useState(false);
//   const [groupByCity, setGroupByCity] = useState(false);
//   const [drillDownCity, setDrillDownCity] = useState(null);
//   const [drillDownSalesman, setDrillDownSalesman] = useState(null);

//   const token = sessionStorage.getItem("auth_token");

//   useEffect(() => {
//     const today = new Date();
//     const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
//     setFromDate(firstDay);
//     setToDate(today);
//   }, []);

//   useEffect(() => {
//     if (fromDate && toDate) fetchChartData();
//   }, [fromDate, toDate, groupBySalesman, groupByCity, drillDownCity, drillDownSalesman]);

//   const fetchChartData = async () => {
//     try {
//       setLoading(true);
//       const params = {
//         from_date: format(fromDate, "yyyy-MM-dd"),
//         to_date: format(toDate, "yyyy-MM-dd"),
//       };

//       let endpoint = "/api/date-wise";

//       if (drillDownSalesman && drillDownCity) {
//         endpoint = "/api/city-salesman-dates";
//         params.city = drillDownCity;
//         params.salesman = drillDownSalesman;
//       } else if (drillDownCity && groupByCity) {
//         endpoint = "/api/city-salesman";
//         params.city = drillDownCity;
//       } else if (drillDownSalesman && groupBySalesman) {
//         endpoint = "/api/salesman-city";
//         params.salesman = drillDownSalesman;
//       } else if (groupByCity) {
//         endpoint = "/api/city-wise";
//       } else if (groupBySalesman) {
//         endpoint = "/api/salesman-wise";
//       }

//       const res = await axios.get(`http://127.0.0.1:8000${endpoint}`, {
//         params,
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = res.data || [];

//       if (!data.length) {
//         setChartData({ series: [], options: {}, categories: [] });
//         return;
//       }

//       // ===============================
//       // Build Series + Categories
//       // ===============================
//       let series = [];
//       let categories = [];
//       let xAxisLabel = "";

//       const createSeriesForDates = dataList => {
//         const dateList = [...new Set(dataList.map(d => d.date))].sort(
//           (a, b) => new Date(b) - new Date(a)
//         );
//         return {
//           categories: dateList.map(d => format(new Date(d), "dd-MM-yyyy")),
//           series: [
//             {
//               name: "Sale",
//               data: dateList.map(d =>
//                 dataList.filter(x => x.date === d).reduce((a, b) => a + b.sales, 0)
//               ),
//             },
//             {
//               name: "Profit",
//               data: dateList.map(d =>
//                 dataList.filter(x => x.date === d).reduce((a, b) => a + b.profit, 0)
//               ),
//             },
//           ],
//         };
//       };

//       if (drillDownSalesman && drillDownCity) {
//         const result = createSeriesForDates(data);
//         categories = result.categories;
//         series = result.series;
//         xAxisLabel = `${drillDownSalesman} in ${drillDownCity} (Date-wise)`;
//       } else if (drillDownSalesman && groupBySalesman) {
//         categories = data.map(d => d.city);
//         series = [
//           { name: "Sale", data: data.map(d => d.sales) },
//           { name: "Profit", data: data.map(d => d.profit) },
//         ];
//         xAxisLabel = `Cities for ${drillDownSalesman}`;
//       } else if (drillDownCity && groupByCity) {
//         categories = data.map(d => d.salesman);
//         series = [
//           { name: "Sale", data: data.map(d => d.sales) },
//           { name: "Profit", data: data.map(d => d.profit) },
//         ];
//         xAxisLabel = `Salesmen in ${drillDownCity}`;
//       } else if (groupBySalesman) {
//         categories = data.map(d => d.salesman);
//         series = [
//           { name: "Sale", data: data.map(d => d.sales) },
//           { name: "Profit", data: data.map(d => d.profit) },
//         ];
//         xAxisLabel = "Salesman";
//       } else if (groupByCity) {
//         categories = data.map(d => d.city);
//         series = [
//           { name: "Sale", data: data.map(d => d.sales) },
//           { name: "Profit", data: data.map(d => d.profit) },
//         ];
//         xAxisLabel = "City";
//       } else {
//         const result = createSeriesForDates(data);
//         categories = result.categories;
//         series = result.series;
//         xAxisLabel = "Date";
//       }

//       setChartData({
//         series,
//         categories,
//         options: {
//           chart: {
//             type: "bar",
//             stacked: true,
//             height: 800,
//             events: {
//               dataPointSelection: (event, ctx, config) => {
//                 const clicked = categories[config.dataPointIndex];

//                 if (groupByCity && !drillDownCity) {
//                   setDrillDownCity(clicked);
//                 } else if (drillDownCity && groupByCity && !drillDownSalesman) {
//                   setDrillDownSalesman(clicked);
//                 } else if (groupBySalesman && !drillDownSalesman) {
//                   setDrillDownSalesman(clicked);
//                 } else if (drillDownSalesman && groupBySalesman && !drillDownCity) {
//                   setDrillDownCity(clicked);
//                 }
//               },
//             },
//           },
//           plotOptions: { bar: { horizontal: false, columnWidth: "70%" } },
//           xaxis: {
//             categories,
//             title: { text: xAxisLabel, style: { fontWeight: 600, fontSize: "14px" } },
//             labels: {
//               rotate: -45,
//               rotateAlways: false,
//               hideOverlappingLabels: true,
//               trim: true,
//               style: { fontSize: "10px", fontWeight: 600 },
//             },
//           },
//           grid: { padding: { bottom: 100 } },
//           yaxis: {
//             forceNiceScale: true,
//             title: { text: "Amount (₹)", style: { fontWeight: 600, fontSize: "14px" } },
//             labels: {
//               formatter: val =>
//                 `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//             },
//           },
//           colors: ["#3498db", "#2ecc71"],
//           tooltip: {
//             shared: false,
//             y: {
//               formatter: (val, { seriesIndex, w }) =>
//                 `${w.globals.seriesNames[seriesIndex]}: ₹${val.toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                 })}`,
//             },
//           },
//           dataLabels: {
//             enabled: true,
//             formatter: val =>
//               `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//           },
//           legend: { position: "top" },
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       setChartData({ series: [], options: {}, categories: [] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const { pieSeries, pieLabels } = useMemo(() => {
//     if (!chartData.series?.length || !chartData.series[1]?.data)
//       return { pieSeries: [], pieLabels: [] };

//     const profitData = chartData.series[1].data;
//     const labels = chartData.categories || [];

//     const cleanedSeries = profitData.map(val => {
//       const num = Number(val);
//       return Number.isFinite(num) && num > 0 ? num : 0;
//     });

//     return { pieSeries: cleanedSeries, pieLabels: labels };
//   }, [chartData]);

//   const getPieChartTitle = () => {
//     if (drillDownSalesman && drillDownCity)
//       return `Date-wise Profit distribution for ${drillDownSalesman} in ${drillDownCity}`;
//     if (drillDownCity && groupByCity)
//       return `Salesman-wise Profit distribution in ${drillDownCity}`;
//     if (drillDownSalesman && groupBySalesman)
//       return `City-wise Profit distribution for ${drillDownSalesman}`;
//     if (groupByCity) return "City-wise Profit distribution";
//     if (groupBySalesman) return "Salesman-wise Profit distribution";
//     return "Date-wise Profit distribution";
//   };

//   return (
//     <MainCard title="Profit Analysis Chart">
//       <div style={{ width: "100%", padding: "20px" }}>
//         <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
//           <div>
//             <label>From: </label>
//             <DatePicker
//               selected={fromDate}
//               onChange={date => {
//                 setFromDate(date);
//                 if (toDate && date > toDate) setToDate(null);
//               }}
//               dateFormat="dd-MM-yyyy"
//             />
//           </div>
//           <div>
//             <label>To: </label>
//             <DatePicker
//               selected={toDate}
//               onChange={date => setToDate(date)}
//               dateFormat="dd-MM-yyyy"
//               minDate={fromDate}
//             />
//           </div>
//           <div>
//             <label style={{ marginRight: "10px" }}>
//               <input
//                 type="checkbox"
//                 checked={groupBySalesman}
//                 onChange={e => {
//                   setGroupBySalesman(e.target.checked);
//                   if (e.target.checked) setGroupByCity(false);
//                   setDrillDownCity(null);
//                   setDrillDownSalesman(null);
//                 }}
//               />{" "}
//               Salesman
//             </label>
//             <label>
//               <input
//                 type="checkbox"
//                 checked={groupByCity}
//                 onChange={e => {
//                   setGroupByCity(e.target.checked);
//                   if (e.target.checked) setGroupBySalesman(false);
//                   setDrillDownCity(null);
//                   setDrillDownSalesman(null);
//                 }}
//               />{" "}
//               City
//             </label>
//           </div>
//         </div>

//         <div style={{ marginTop: "10px" }}>
//           {drillDownSalesman && drillDownCity && (
//             <>
//               <button onClick={() => setDrillDownCity(null)}>← Back to Cities</button>
//               <button onClick={() => setDrillDownSalesman(null)} style={{ marginLeft: "10px" }}>
//                 ← Back to Salesmen
//               </button>
//             </>
//           )}
//           {!drillDownCity && drillDownSalesman && groupBySalesman && (
//             <button onClick={() => setDrillDownSalesman(null)}>← Back to Salesmen</button>
//           )}
//           {!drillDownSalesman && drillDownCity && groupByCity && (
//             <button onClick={() => setDrillDownCity(null)}>← Back to Cities</button>
//           )}
//         </div>

//         <div
//           style={{
//             width: "100%",
//             marginTop: "20px",
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "20px",
//           }}
//         >
//           {loading ? (
//             <p>Loading chart...</p>
//           ) : !chartData.series || chartData.series.length === 0 || pieSeries.length === 0 ? (
//             <p style={{ textAlign: "center", marginTop: 180, fontSize: "18px", color: "#888" }}>
//               No data found for selected range.
//             </p>
//           ) : (
//             <>
//               <Chart options={chartData.options} series={chartData.series} type="bar" height={500} />
//               <Chart
//                 type="pie"
//                 height={400}
//                 options={{
//                   chart: { type: "pie" },
//                   labels: pieLabels,
//                   colors: Array.from({ length: pieSeries.length }, (_, i) => {
//                     const hue = (i * 360) / pieSeries.length;
//                     return `hsl(${hue}, 70%, 50%)`;
//                   }),
//                   title: {
//                     text: getPieChartTitle(),
//                     align: "center",
//                     style: { fontWeight: 600, fontSize: "16px" },
//                   },
//                   legend: { position: "bottom" },
//                   tooltip: {
//                     y: {
//                       formatter: val =>
//                         `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//                     },
//                   },
//                 }}
//                 series={pieSeries}
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </MainCard>
//   );
// }
