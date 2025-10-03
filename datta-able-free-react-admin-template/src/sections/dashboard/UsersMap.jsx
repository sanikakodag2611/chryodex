import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import MainCard from "components/MainCard";
import { useTable, usePagination, useSortBy } from "react-table";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const formatDate = (d) => (d ? format(new Date(d), "dd-MM-yyyy") : "");

export default function UsersMap() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ series: [], options: {}, categories: [] });
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBySalesman, setGroupBySalesman] = useState(false);
  const [groupByCity, setGroupByCity] = useState(false);
  const [drillDownCity, setDrillDownCity] = useState(null);
  const [drillDownSalesman, setDrillDownSalesman] = useState(null);
  const [drillPath, setDrillPath] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const token = sessionStorage.getItem("auth_token");
  const [designationId, setDesignationId] = useState(sessionStorage.getItem("designation_id"));
  const isSalesman = designationId === "8";

  // Log initial designationId when component mounts
  useEffect(() => {
    console.log("Initial designationId on mount:", designationId);
  }, []);

  // Log designationId whenever it changes via storage event
  useEffect(() => {
    const handleStorageChange = () => {
      const newDesignationId = sessionStorage.getItem("designation_id");
      console.log("designationId changed via storage event:", newDesignationId);
      setDesignationId(newDesignationId);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Log designationId whenever isSalesman is evaluated
  console.log("Current designationId (isSalesman check):", designationId, "isSalesman:", isSalesman);

  const totalSales = chartData.series?.[0]?.data?.reduce((sum, val) => sum + (Number(val) || 0), 0) || 0;
  const totalProfit = !isSalesman && chartData.series?.[1]?.data ? chartData.series[1].data.reduce((sum, val) => sum + (Number(val) || 0), 0) : 0;
  const TOTAL_EXPENSES = 100000;
  const grossProfit = !isSalesman && totalProfit ? totalProfit - TOTAL_EXPENSES : 0;

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const start = today >= new Date(year, 3, 1) ? new Date(year, 3, 1) : new Date(year - 1, 3, 1);
    const end = new Date(start.getFullYear() + 1, 2, 31);
    setFinancialYearStart(start);
    setFinancialYearEnd(end);
    setFromDate(firstDayOfMonth);
    setToDate(today);
  }, []);

  const [financialYearStart, setFinancialYearStart] = useState(null);
  const [financialYearEnd, setFinancialYearEnd] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    if (fromDate && toDate) {
      console.log("Fetching data with designationId:", designationId);
      fetchChartData();
      fetchTableData();
    }
  }, [fromDate, toDate, groupBySalesman, groupByCity, drillDownCity, drillDownSalesman, designationId]);

  const handleFromDateChange = (date) => {
    if (financialYearStart && financialYearEnd && (date < financialYearStart || date > financialYearEnd)) {
      setErrorMessage(
        `From date must be between ${format(financialYearStart, "dd-MM-yyyy")} and ${format(financialYearEnd, "dd-MM-yyyy")}`
      );
      return;
    }
    if (toDate && date > toDate) {
      setErrorMessage("From date cannot be after To date.");
      return;
    }
    setErrorMessage("");
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    if (financialYearStart && financialYearEnd && (date < financialYearStart || date > financialYearEnd)) {
      setErrorMessage(
        `To date must be between ${format(financialYearStart, "dd-MM-yyyy")} and ${format(financialYearEnd, "dd-MM-yyyy")}`
      );
      setToDate(null);
      return;
    }
    if (fromDate && date < fromDate) {
      setErrorMessage("To date cannot be before From date.");
      setToDate(null);
      return;
    }
    setErrorMessage("");
    setToDate(date);
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const params = { from_date: format(fromDate, "yyyy-MM-dd"), to_date: format(toDate, "yyyy-MM-dd") };
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
      } else if (groupByCity) endpoint = "/api/city-wise";
      else if (groupBySalesman) endpoint = "/api/salesman-wise";
      console.log("fetchChartData with designationId:", designationId);
      const res = await axios.get(`http://127.0.0.1:8000${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      console.log("Chart data received:", data);
      if (!data.length) return setChartData({ series: [], options: {}, categories: [] });

      let series = [], categories = [], xAxisLabel = "";
      const createSeriesForDates = (dataList) => {
        const dateList = [...new Set(dataList.map((d) => d.date))].sort((a, b) => new Date(b) - new Date(a));
        return {
          categories: dateList.map((d) => format(new Date(d), "dd-MM-yyyy")),
          series: [
            {
              name: "Sale",
              data: dateList.map((d) =>
                Number(dataList.filter((x) => x.date === d).reduce((a, b) => a + (Number(b.sales) || 0), 0).toFixed(2))
              ),
            },
            ...(data[0]?.profit !== undefined && !isSalesman
              ? [
                  {
                    name: "Profit",
                    data: dateList.map((d) =>
                      Number(dataList.filter((x) => x.date === d).reduce((a, b) => a + (Number(b.profit) || 0), 0).toFixed(2))
                    ),
                  },
                ]
              : []),
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
          { name: "Sale", data: data.map((d) => Number(d.sales).toFixed(2)) },
          ...(!isSalesman ? [{ name: "Profit", data: data.map((d) => Number(d.profit).toFixed(2)) }] : []),
        ];
        xAxisLabel = `Cities for ${drillDownSalesman}`;
      } else if (drillDownCity && groupByCity) {
        categories = data.map((d) => d.salesman);
        series = [
          { name: "Sale", data: data.map((d) => Number(d.sales).toFixed(2)) },
          ...(!isSalesman ? [{ name: "Profit", data: data.map((d) => Number(d.profit).toFixed(2)) }] : []),
        ];
        xAxisLabel = `Salesmen in ${drillDownCity}`;
      } else if (groupBySalesman) {
        categories = data.map((d) => d.salesman);
        series = [
          { name: "Sale", data: data.map((d) => Number(d.sales).toFixed(2)) },
          ...(!isSalesman ? [{ name: "Profit", data: data.map((d) => Number(d.profit).toFixed(2)) }] : []),
        ];
        xAxisLabel = "Salesman";
      } else if (groupByCity) {
        categories = data.map((d) => d.city);
        series = [
          { name: "Sale", data: data.map((d) => Number(d.sales).toFixed(2)) },
          ...(!isSalesman ? [{ name: "Profit", data: data.map((d) => Number(d.profit).toFixed(2)) }] : []),
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
            height: 400,
            events: {
              dataPointSelection: (event, ctx, config) => {
                if (!groupByCity && !groupBySalesman) return;
                const clicked = categories[config.dataPointIndex];
                if (groupByCity && !drillDownCity) {
                  setDrillDownCity(clicked);
                  setDrillPath((prev) => [...prev, clicked]);
                } else if (drillDownCity && groupByCity && !drillDownSalesman) {
                  setDrillDownSalesman(clicked);
                  setDrillPath((prev) => [...prev, clicked]);
                } else if (groupBySalesman && !drillDownSalesman) {
                  setDrillDownSalesman(clicked);
                  setDrillPath((prev) => [...prev, clicked]);
                } else if (drillDownSalesman && groupBySalesman && !drillDownCity) {
                  setDrillDownCity(clicked);
                  setDrillPath((prev) => [...prev, clicked]);
                }
              },
            },
          },
          plotOptions: { bar: { horizontal: false, columnWidth: "60%" } },
          xaxis: {
            categories,
            title: { text: xAxisLabel, style: { fontWeight: 600, fontSize: "14px" } },
            labels: {
              rotate: -45,
              hideOverlappingLabels: true,
              trim: true,
              minHeight: 70,
              style: { fontSize: "10px", fontWeight: 600 },
            },
            tickPlacement: "between",
          },
          yaxis: {
            min: 0,
            forceNiceScale: true,
            title: { text: "Amount (₹)", style: { fontWeight: 600, fontSize: "13px" } },
            labels: { formatter: (val) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
          },
          colors: ["#3498db", ...(!isSalesman ? ["#2ecc71"] : [])],
          dataLabels: {
            enabled: true,
            formatter: (val) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          },
          legend: { position: "top", horizontalAlign: "center", markers: { width: 15, height: 15 } },
          tooltip: {
            shared: false,
            y: {
              formatter: (val, { seriesIndex, w }) =>
                `${w.globals.seriesNames[seriesIndex]}: ₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            },
          },
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
      console.log("fetchTableData with designationId:", designationId);
      const params = { from_date: format(fromDate, "yyyy-MM-dd"), to_date: format(toDate, "yyyy-MM-dd") };
      if (drillDownCity) params.city = drillDownCity;
      if (drillDownSalesman) params.salesman = drillDownSalesman;
      if (groupByCity) params.group_by = "city";
      if (groupBySalesman) params.group_by = "salesman";
      const res = await axios.get("http://127.0.0.1:8000/api/sales-details", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Table data received:", res.data);
      // Debug: Log specific amounts from table data
      console.log(
        "Debug Table Amounts - Raw Data:",
        res.data.map((row) => ({
          id: row.id || "N/A",
          type: row.type,
          salesman: row.salesman,
          customer: row.customer,
          product: row.product,
          date: formatDate(row.date),
          basic_cost: row.basic_cost,
          transport: row.transport,
          commission: row.commission,
          net_amount: row.net_amount,
          profit_amount: row.profit_amount,
          profit_percentage: row.profit_percentage,
          gst_amount: row.gst_amount,
          grand_total: row.grand_total,
        }))
      );
      setTableData(res.data || []);
    } catch (err) {
      console.error("Error fetching table data:", err);
      setTableData([]);
    }
  };

  const handleBack = (index) => {
    const newPath = drillPath.slice(0, index);
    setDrillPath(newPath);
    if (groupByCity && !groupBySalesman) {
      setDrillDownCity(newPath[index - 1] || null);
      setDrillDownSalesman(null);
    } else if (groupBySalesman && !groupByCity) {
      setDrillDownSalesman(newPath[index - 1] || null);
      setDrillDownCity(null);
    } else if (groupByCity && groupBySalesman) {
      setDrillDownCity(newPath[index - 2] || null);
      setDrillDownSalesman(newPath[index - 1] || null);
    }
  };

  const { pieSeries, pieLabels } = useMemo(() => {
    if (!chartData.series?.length || isSalesman) return { pieSeries: [], pieLabels: [] };
    const labels = chartData.categories || [];
    const cleanedSeries = chartData.series[1]?.data.map((val) => (Number(val) > 0 ? Number(val) : 0)) || [];
    return { pieSeries: cleanedSeries, pieLabels: labels };
  }, [chartData, isSalesman]);

  const getPieChartTitle = () => {
    if (isSalesman) return "";
    if (drillDownSalesman && drillDownCity) return `Date-wise Profit for ${drillDownSalesman} in ${drillDownCity}`;
    if (drillDownCity && groupByCity) return `Salesman-wise Profit in ${drillDownCity}`;
    if (drillDownSalesman && groupBySalesman) return `City-wise Profit for ${drillDownSalesman}`;
    if (groupByCity) return "City-wise Profit";
    if (groupBySalesman) return "Salesman-wise Profit";
    return "Date-wise Profit";
  };

  const columns = useMemo(
    () => [
      { Header: "Sr No", accessor: (_, i) => i + 1, Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{value}</span> },
      { Header: "Type", accessor: "type", Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{value}</span> },
      { Header: "Salesman", accessor: "salesman", Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{value}</span> },
      { Header: "Customer", accessor: "customer", Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{value}</span> },
      { Header: "Product", accessor: "product", Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{value}</span> },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "left" }}>{formatDate(value)}</span>,
      },
      {
        Header: "Basic Cost",
        accessor: "basic_cost",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "financial-column highlight-column",
      },
      {
        Header: "Transport",
        accessor: "transport",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "highlight-column",
      },
      {
        Header: "Commission",
        accessor: "commission",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "highlight-column",
      },
      {
        Header: "Net Amount",
        accessor: "net_amount",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "financial-column yellow-column",
      },
      {
        Header: "Profit Amount",
        accessor: "profit_amount",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "financial-column green-column",
      },
      {
        Header: "Profit %",
        accessor: "profit_percentage",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{Number(value || 0).toFixed(2)}%</span>,
        className: "financial-column green-column",
      },
      {
        Header: "GST Amount",
        accessor: "gst_amount",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "financial-column red-column",
      },
      {
        Header: "Grand Total",
        accessor: "grand_total",
        Cell: ({ value }) => <span style={{ display: "block", textAlign: "right" }}>{formatCurrency(value)}</span>,
        className: "financial-column red-column",
      },
    ],
    []
  );

  const filteredCustomers = useMemo(() => {
    if (!selectedProduct) return [...new Set(tableData.map((row) => row.customer).filter((c) => c))];
    return [...new Set(tableData.filter((row) => row.product === selectedProduct && row.customer).map((row) => row.customer))];
  }, [selectedProduct, tableData]);

  const filteredProducts = useMemo(() => {
    if (!selectedCustomer) return [...new Set(tableData.map((row) => row.product).filter((p) => p))];
    return [...new Set(tableData.filter((row) => row.customer === selectedCustomer && row.product).map((row) => row.product))];
  }, [selectedCustomer, tableData]);

  // Reset selectedProduct if it's not in filteredProducts
  useEffect(() => {
    if (selectedProduct && !filteredProducts.includes(selectedProduct)) {
      setSelectedProduct("");
    }
  }, [filteredProducts, selectedProduct]);

  // Reset selectedCustomer if it's not in filteredCustomers
  useEffect(() => {
    if (selectedCustomer && !filteredCustomers.includes(selectedCustomer)) {
      setSelectedCustomer("");
    }
  }, [filteredCustomers, selectedCustomer]);

  const filteredData = useMemo(() => {
    return tableData.filter((row, i) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (i + 1).toString().includes(lowerSearch) ||
        (row.date && format(new Date(row.date), "dd-MM-yyyy").toLowerCase().includes(lowerSearch)) ||
        Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(lowerSearch));
      const matchCustomer = !selectedCustomer || row.customer === selectedCustomer;
      const matchProduct = !selectedProduct || row.product === selectedProduct;
      return matchSearch && matchCustomer && matchProduct;
    });
  }, [searchTerm, selectedCustomer, selectedProduct, tableData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    state: { pageIndex },
    setPageSize: setTablePageSize,
  } = useTable({ columns, data: filteredData, initialState: { pageIndex: 0, pageSize } }, useSortBy, usePagination);

  useEffect(() => setTablePageSize(pageSize), [pageSize, setTablePageSize]);

  const showFinancials = !isSalesman && tableData.length > 0 && tableData[0]?.profit_amount !== null;
  console.log("showFinancials evaluation with designationId:", designationId, "showFinancials:", showFinancials);

  const totalBasic = showFinancials ? filteredData.reduce((s, r) => s + Number(r.basic_cost || 0), 0) : 0;
  const totalTransport = filteredData.reduce((s, r) => s + Number(r.transport || 0), 0);
  const totalCommission = filteredData.reduce((s, r) => s + Number(r.commission || 0), 0);
  const totalNetAmount = showFinancials ? filteredData.reduce((s, r) => s + Number(r.net_amount || 0), 0) : 0;
  const totalProfitAmt = showFinancials ? filteredData.reduce((s, r) => s + Number(r.profit_amount || 0), 0) : 0;
  const totalProfitPct = showFinancials && (totalNetAmount + totalProfitAmt) > 0
    ? Math.min((totalProfitAmt / (totalNetAmount + totalProfitAmt)) * 100, 100).toFixed(2)
    : "0.00";
  const totalGst = showFinancials ? filteredData.reduce((s, r) => s + Number(r.gst_amount || 0), 0) : 0;
  const totalGrand = showFinancials ? filteredData.reduce((s, r) => s + Number(r.grand_total || 0), 0) : 0;

  // Debug: Log the calculated totals for table display
  console.log("Debug Table Displayed Amounts - Totals:");
  console.log("showFinancials:", showFinancials);
  console.log("totalBasic:", totalBasic);
  console.log("totalTransport:", totalTransport);
  console.log("totalCommission:", totalCommission);
  console.log("totalNetAmount:", totalNetAmount);
  console.log("totalProfitAmt:", totalProfitAmt);
  console.log("totalProfitPct:", totalProfitPct);
  console.log("totalGst:", totalGst);
  console.log("totalGrand:", totalGrand);
  console.log("Filtered Data Length:", filteredData.length);

  const StatCard = ({ label, value, bg }) => (
    <div
      style={{
        backgroundColor: bg,
        color: "#fff",
        padding: "15px 25px",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 14,
        minWidth: "150px",
      }}
    >
      {label}: {formatCurrency(value)}
    </div>
  );

  return (
    <MainCard title="Profit Analysis Dashboard">
      <style>
        {`
          .scroll-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
          }
          .hide-financial .financial-column {
            display: none;
          }
          .highlight-column {
            background-color: #f5faff; /* Lighter blue for Transport, Commission, Basic Cost */
          }
          .yellow-column {
            background-color: #ffffcc; /* Lighter yellow for Net Amount */
          }
          .green-column {
            background-color: #e6ffe6; /* Lighter green for Profit Amount and Profit % */
          }
          .red-column {
            background-color: #ffe6e6; /* Lighter red for GST Amount and Grand Total */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1200px; /* Ensure table is wide enough to trigger scrollbar on small screens */
          }
          .chart-container {
            min-width: 600px; /* Ensure charts are wide enough to trigger scrollbar if needed */
          }
          .filter-container, .stat-card-container {
            flex-wrap: wrap;
            gap: 10px;
          }
          @media (max-width: 768px) {
            .filter-container, .stat-card-container {
              flex-direction: column;
              align-items: stretch;
            }
            .filter-container input, .filter-container select {
              width: 100%;
              max-width: 250px;
            }
            .chart-container {
              grid-template-columns: 1fr; /* Stack charts vertically on small screens */
            }
          }
        `}
      </style>
      <div className="scroll-container">
        <div className="filter-container" style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 10, padding: "10px" }}>
          <div>
            <label>From: </label>
            <DatePicker selected={fromDate} onChange={handleFromDateChange} dateFormat="dd-MM-yyyy" placeholderText="Select From Date" />
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

        {errorMessage && <div style={{ color: "red", fontWeight: "bold", marginBottom: "15px", padding: "0 10px" }}>{errorMessage}</div>}

        <div style={{ marginBottom: 10, padding: "0 10px" }}>
          {drillPath.length > 0 && (groupByCity || groupBySalesman) &&
            drillPath.map((level, index) => (
              <button
                key={index}
                onClick={() => handleBack(index)}
                style={{ marginRight: 8, padding: "5px 10px", fontSize: 12 }}
              >
                ← Back to {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
        </div>

        <div className="chart-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "20px", padding: "0 10px" }}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading chart...</p>
          ) : !chartData.series?.length ? (
            <p style={{ textAlign: "center", marginTop: 80, fontSize: "16px", color: "#888" }}>
              No data found for selected range.
            </p>
          ) : (
            <>
              <Chart options={chartData.options} series={chartData.series} type="bar" height={500} />
              {!isSalesman && pieSeries.length > 0 && (
                <Chart
                  type="pie"
                  height={500}
                  options={{
                    chart: { type: "pie" },
                    labels: pieLabels,
                    colors: ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c"],
                    legend: { position: "right", horizontalAlign: "center" },
                    dataLabels: {
                      enabled: true,
                      formatter: (val, opts) => {
                        const idx = opts.seriesIndex;
                        const value = opts.w.globals.series[idx];
                        return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
                      },
                    },
                    tooltip: {
                      y: {
                        formatter: (value) => `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      },
                    },
                    title: { text: getPieChartTitle(), align: "center", style: { fontSize: 16, fontWeight: 600 } },
                  }}
                  series={pieSeries}
                />
              )}
            </>
          )}
        </div>

        {(() => {
          if (chartData.categories?.length > 0 && chartData.series?.length > 0) {
            console.log("=== Chart Categories/Dates ===");
            console.log(chartData.categories);
            console.log("=== Series Data (aligned with categories) ===");
            chartData.series.forEach((serie, index) => {
              console.log(`${serie.name}:`, serie.data);
            });
            const tableData = chartData.categories.map((category, i) => {
              const row = { "Date/Category": category };
              chartData.series.forEach((serie) => {
                const value = Number(serie.data[i] || 0);
                row[serie.name] = value >= 0 ? value.toFixed(2) : `-${Math.abs(value).toFixed(2)}`;
              });
              return row;
            });
            console.table(tableData);
          }
        })()}

        <div
          className="stat-card-container"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "20px",
            marginBottom: "25px",
            padding: "0 10px",
          }}
        >
          <StatCard label="Total Sales" value={totalSales} bg="#3498db" />
          {!isSalesman && (
            <>
              <StatCard label="Total Profit" value={totalProfit} bg="#2ecc71" />
              <StatCard label="Total Expenses" value={TOTAL_EXPENSES} bg="#e74c3c" />
              <StatCard label="Gross Profit" value={grossProfit} bg="#f1c40f" />
            </>
          )}
        </div>

        <h3 style={{ textAlign: "center", padding: "0 10px" }}>Detailed sales data</h3>

        <div className="filter-container" style={{ marginBottom: 10, display: "flex", gap: "15px", padding: "0 10px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            style={{ padding: 5, width: "250px" }}
          />
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">All Customers</option>
            {filteredCustomers.map((cust, idx) => (
              <option key={idx} value={cust}>
                {cust}
              </option>
            ))}
          </select>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {filteredProducts.map((prod, idx) => (
              <option key={idx} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto", padding: "0 10px" }}>
          <table {...getTableProps()} className={showFinancials ? "" : "hide-financial"} style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={column.className}
                      style={{
                        border: "1px solid #ccc",
                        padding: "5px",
                        background: "#f0f0f0",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column.render("Header")}
                      <span style={{ marginLeft: 5 }}>{column.isSorted ? (column.isSortedDesc ? "↓" : "↑") : "↓↑"}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row, i) => {
                prepareRow(row);
                // Debug: Log the data for each row as displayed in the table
                console.log(
                  `Debug Table Row ${i + 1}:`,
                  {
                    "Sr No": i + 1,
                    Type: row.original.type,
                    Salesman: row.original.salesman,
                    Customer: row.original.customer,
                    Product: row.original.product,
                    Date: formatDate(row.original.date),
                    "Basic Cost": showFinancials ? formatCurrency(row.original.basic_cost) : "N/A",
                    Transport: formatCurrency(row.original.transport),
                    Commission: formatCurrency(row.original.commission),
                    "Net Amount": showFinancials ? formatCurrency(row.original.net_amount) : "N/A",
                    "Profit Amount": showFinancials ? formatCurrency(row.original.profit_amount) : "N/A",
                    "Profit %": showFinancials ? `${Number(row.original.profit_percentage || 0).toFixed(2)}%` : "N/A",
                    "GST Amount": showFinancials ? formatCurrency(row.original.gst_amount) : "N/A",
                    "Grand Total": showFinancials ? formatCurrency(row.original.grand_total) : "N/A",
                  }
                );
                return (
                  <tr {...row.getRowProps()} style={{ borderBottom: "1px solid #eee" }}>
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className={cell.column.className}
                        style={{
                          padding: "5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#e0e0f0", fontWeight: 600 }}>
                <td colSpan={6} style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                  Total
                </td>
                {showFinancials && (
                  <td className="financial-column highlight-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                    {formatCurrency(totalBasic)}
                  </td>
                )}
                <td className="highlight-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                  {formatCurrency(totalTransport)}
                </td>
                <td className="highlight-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                  {formatCurrency(totalCommission)}
                </td>
                {showFinancials && (
                  <>
                    <td className="financial-column yellow-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                      {formatCurrency(totalNetAmount)}
                    </td>
                    <td className="financial-column green-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                      {formatCurrency(totalProfitAmt)}
                    </td>
                    <td className="financial-column green-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                      {totalProfitPct}%
                    </td>
                    <td className="financial-column red-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                      {formatCurrency(totalGst)}
                    </td>
                    <td className="financial-column red-column" style={{ border: "1px solid #ddd", padding: "6px", textAlign: "right" }}>
                      {formatCurrency(totalGrand)}
                    </td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 10px" }}>
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </button>
          <span>
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <b>Show: </b>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </MainCard>
  );
}