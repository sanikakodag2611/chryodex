// // react-bootstrap
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

// // project-imports
// import SalesPerformanceCard from 'components/cards/SalesPerformanceCard';
// import SocialStatsCard from 'components/cards/SocialStatsCard';
// import StatIndicatorCard from 'components/cards/StatIndicatorCard';
// import { UsersMap, EarningChart, RatingCard, RecentUsersCard } from 'sections/dashboard/default';

// // ===============================|| SALES PERFORMANCE CARD - DATA ||============================== //

// const salesPerformanceData = [
//   { title: 'Daily Sales', icon: 'ph ph-arrow-up text-success', amount: '$ 249.95', progress: { now: 67, className: 'bg-brand-color-1' } },
//   {
//     title: 'Monthly Sales',
//     icon: 'ph ph-arrow-down text-danger',
//     amount: '$ 2,942.32',
//     progress: { now: 36, className: 'bg-brand-color-2' }
//   },
//   { title: 'Yearly Sales', icon: 'ph ph-arrow-up text-success', amount: '$ 8,638.32', progress: { now: 80, className: 'bg-brand-color-1' } }
// ];

// // ===============================|| STAT INDICATOR CARD - DATA ||============================== //

// const statIndicatorData = [
//   { icon: 'ph ph-lightbulb-filament', value: '235', label: 'TOTAL IDEAS', iconColor: 'text-success' },
//   { icon: 'ph ph-map-pin-line', value: '26', label: 'TOTAL LOCATION', iconColor: 'text-primary' }
// ];

// // ===============================|| SOCIAL STATS CARD - DATA ||============================== //

// const socialStatsData = [
//   {
//     icon: 'ti ti-brand-facebook-filled text-primary',
//     count: '12,281',
//     percentage: '+7.2%',
//     color: 'text-success',
//     stats: [
//       {
//         label: 'Target',
//         value: '35,098',
//         progress: {
//           now: 60,
//           className: 'bg-brand-color-1'
//         }
//       },
//       {
//         label: 'Duration',
//         value: '3,539',
//         progress: {
//           now: 45,
//           className: 'bg-brand-color-2'
//         }
//       }
//     ]
//   },
//   {
//     icon: 'ti ti-brand-twitter-filled text-info',
//     count: '11,200',
//     percentage: '+6.2%',
//     color: 'text-primary',
//     stats: [
//       {
//         label: 'Target',
//         value: '34,185',
//         progress: {
//           now: 40,
//           className: 'bg-success'
//         }
//       },
//       {
//         label: 'Duration',
//         value: '4,567',
//         progress: {
//           now: 70
//         }
//       }
//     ]
//   },
//   {
//     icon: 'ti ti-brand-google-filled text-danger',
//     count: '10,500',
//     percentage: '+5.9%',
//     color: 'text-primary',
//     stats: [
//       {
//         label: 'Target',
//         value: '25,998',
//         progress: {
//           now: 80,
//           className: 'bg-brand-color-1'
//         }
//       },
//       {
//         label: 'Duration',
//         value: '7,753',
//         progress: {
//           now: 50,
//           className: 'bg-brand-color-2'
//         }
//       }
//     ]
//   }
// ];

// // ================================|| DASHBOARD - DEFAULT ||============================== //

// export default function DefaultPage() {
//   return (
//     <Row>
//       {/* row - 1 */}
//       {salesPerformanceData.map((item, index) => (
//         <Col key={index} md={index === 2 ? 12 : 6} xl={4}>
//           <SalesPerformanceCard {...item} />
//         </Col>
//       ))}

//       {/* row - 2 */}
//       <Col md={12} xl={58}>
//         <UsersMap />
//       </Col>
//       {/* <Col md={6} xl={4}>
//         <>
//           <EarningChart /> 
//           <StatIndicatorCard data={statIndicatorData} />
//         </>
//       </Col> */}

//       {/* row - 3 */}
//       {/* {socialStatsData.map((item, index) => (
//         <Col key={index} md={index === 0 ? 12 : 6} xl={4}>
//           <SocialStatsCard {...item} />
//         </Col>
//       ))} */}

//       {/* row - 4 */}
//       {/* <Col md={6} xl={4}>
//         <RatingCard />
//       </Col>
//       <Col md={6} xl={8}>
//         <RecentUsersCard />
//       </Col> */}
//     </Row>
//   );
// }


// import { useState, useEffect } from "react";
// import axios from "axios";

// // react-bootstrap
// import Col from "react-bootstrap/Col";
// import Row from "react-bootstrap/Row";

// // project-imports
// import SalesPerformanceCard from "components/cards/SalesPerformanceCard";
// import { UsersMap } from "sections/dashboard/default";

// export default function DefaultPage() {
//   const [salesData, setSalesData] = useState([]);
//   const [profitData, setProfitData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSalesData = async () => {
//       try {
//         setLoading(true);

//         // 1️⃣ Get token from sessionStorage
//         const token = sessionStorage.getItem("auth_token");
//         if (!token) {
//           throw new Error("No auth token found. Please log in again.");
//         }

//        // 2️⃣ Dynamic dates
//       // const today = new Date();
//       // const dateStr = today.toISOString().slice(0, 10);  

//       // const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
//       //   .toISOString()
//       //   .slice(0, 10);

//       // const yearStart = new Date(today.getFullYear(), 0, 1)
//       //   .toISOString()
//       //   .slice(0, 10);

//       // // 3️⃣ Fetch totals data (daily, monthly, yearly) with Bearer token
//       // const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
//       //   axios.get(
//       //     `http://127.0.0.1:8000/api/totals?from_date=${dateStr}&to_date=${dateStr}`,
//       //     { headers: { Authorization: `Bearer ${token}` } }
//       //   ),
//       //   axios.get(
//       //     `http://127.0.0.1:8000/api/totals?from_date=${monthStart}&to_date=${dateStr}`,
//       //     { headers: { Authorization: `Bearer ${token}` } }
//       //   ),
//       //   axios.get(
//       //     `http://127.0.0.1:8000/api/totals?from_date=${yearStart}&to_date=${dateStr}`,
//       //     { headers: { Authorization: `Bearer ${token}` } }
//       //   ),
//       // ]);

 


//         // 2️⃣ Example static dates (replace with dynamic if needed)
//         const defaultDaily = "2025-07-31";
//         const defaultMonthStart = "2025-07-01";
//         const defaultYearStart = "2025-07-01";

//         // 3️⃣ Fetch totals data with Bearer token
//         const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
//           axios.get(
//             `http://127.0.0.1:8000/api/totals?from_date=${defaultDaily}&to_date=${defaultDaily}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           ),
//           axios.get(
//             `http://127.0.0.1:8000/api/totals?from_date=${defaultMonthStart}&to_date=${defaultDaily}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           ),
//           axios.get(
//             `http://127.0.0.1:8000/api/totals?from_date=${defaultYearStart}&to_date=${defaultDaily}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           ),
//         ]);

//         // 4️⃣ Set data for UI
//         setSalesData([
//           {
//             title: "Daily Sales",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${dailyRes.data.sales}`,
//             progress: {
//               now: dailyRes.data.profit_percent,
//               className: "bg-brand-color-1",
//             },
//           },
//           {
//             title: "Monthly Sales",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${monthlyRes.data.sales}`,
//             progress: {
//               now: monthlyRes.data.profit_percent,
//               className: "bg-brand-color-2",
//             },
//           },
//           {
//             title: "Yearly Sales",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${yearlyRes.data.sales}`,
//             progress: {
//               now: yearlyRes.data.profit_percent,
//               className: "bg-brand-color-1",
//             },
//           },
//         ]);
//         setProfitData([
//           {
//             title: "Daily Profit",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${dailyRes.data.profit}`,
//             progress: {
//               now: dailyRes.data.profit_percent,
//               className: "bg-brand-color-1",
//             },
//           },
//           {
//             title: "Monthly Profit",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${monthlyRes.data.sales}`,
//             progress: {
//               now: monthlyRes.data.profit_percent,
//               className: "bg-brand-color-2",
//             },
//           },
//           {
//             title: "Yearly Profit",
//             icon: "ph ph-arrow-up text-success",
//             amount: `₹${yearlyRes.data.sales}`,
//             progress: {
//               now: yearlyRes.data.profit_percent,
//               className: "bg-brand-color-1",
//             },
//           },
//         ]);
//       } catch (err) {
//         console.error("Error fetching sales data:", err);
//         setSalesData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSalesData();
//   }, []);

//   return (
//     <Row>
//       {loading ? (
//         <p style={{ padding: 20 }}>Loading sales data...</p>
//       ) : (
//         salesData.map((item, index) => (
//           <Col key={index} md={6} xl={4}>
//             <SalesPerformanceCard {...item} />
//           </Col>
//         ))
//       )}

//       {/* Example: Users Map */}
//       <Col md={12} xl={12} style={{ marginTop: 20 }}>
//         <UsersMap />
//       </Col>
//     </Row>
//   );
// }

import { useState, useEffect } from "react";
import axios from "axios";

// react-bootstrap
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// project-imports
import SalesPerformanceCard from "components/cards/SalesPerformanceCard";
import { UsersMap } from "sections/dashboard/default";

export default function DefaultPage() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formatter for Indian Rupees
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        const token = sessionStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No auth token found. Please log in again.");
        }

        // const defaultDaily = "2025-07-31";
        // const defaultMonthStart = "2025-07-01";
        // const defaultYearStart = "2025-07-01";

        // const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
        //   axios.get(
        //     `http://127.0.0.1:8000/api/totals?from_date=${defaultDaily}&to_date=${defaultDaily}`,
        //     { headers: { Authorization: `Bearer ${token}` } }
        //   ),
        //   axios.get(
        //     `http://127.0.0.1:8000/api/totals?from_date=${defaultMonthStart}&to_date=${defaultDaily}`,
        //     { headers: { Authorization: `Bearer ${token}` } }
        //   ),
        //   axios.get(
        //     `http://127.0.0.1:8000/api/totals?from_date=${defaultYearStart}&to_date=${defaultDaily}`,
        //     { headers: { Authorization: `Bearer ${token}` } }
        //   ),
        // ]);


                // Today's date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = today.getMonth() + 1; // 1-12
        const dd = String(today.getDate()).padStart(2, "0");

        // Format today's date
        const todayStr = `${yyyy}-${String(mm).padStart(2, "0")}-${dd}`;

        // First day of current month
        const monthStartStr = `${yyyy}-${String(mm).padStart(2, "0")}-01`;

        // Determine financial year start (April 1) and end (March 31)
        let fyStart, fyEnd;
        if (mm >= 4) {
          // If current month is April or later, FY starts this year April 1, ends next year March 31
          fyStart = `${yyyy}-04-01`;
          fyEnd = `${yyyy + 1}-03-31`;
        } else {
          // If current month is Jan-Mar, FY started last year April 1, ends this year March 31
          fyStart = `${yyyy - 1}-04-01`;
          fyEnd = `${yyyy}-03-31`;
        }

        // Fetch totals dynamically
        const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
          axios.get(
            `http://127.0.0.1:8000/api/totals?from_date=${todayStr}&to_date=${todayStr}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://127.0.0.1:8000/api/totals?from_date=${monthStartStr}&to_date=${todayStr}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://127.0.0.1:8000/api/totals?from_date=${fyStart}&to_date=${todayStr}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);


        const processData = (sales, profit) => {
          const total = sales + profit;
          let salesPercent = 0;
          let profitPercent = 0;

          if (total > 0) {
            salesPercent = parseFloat(((sales / total) * 100).toFixed(1));
            profitPercent = parseFloat(((profit / total) * 100).toFixed(1));
          }
          return { salesPercent, profitPercent };
        };

        setSalesData([
          {
            title: "Daily Performance",
            sales: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(dailyRes.data.sales),
              value: dailyRes.data.sales,
            },
            profit: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(dailyRes.data.profit),
              value: dailyRes.data.profit,
            },
            progress: processData(dailyRes.data.sales, dailyRes.data.profit),
          },
          {
            title: "Monthly Performance",
            sales: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(monthlyRes.data.sales),
              value: monthlyRes.data.sales,
            },
            profit: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(monthlyRes.data.profit),
              value: monthlyRes.data.profit,
            },
            progress: processData(monthlyRes.data.sales, monthlyRes.data.profit),
          },
          {
            title: "Yearly Performance",
            sales: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(yearlyRes.data.sales),
              value: yearlyRes.data.sales,
            },
            profit: {
              icon: "ph ph-arrow-up text-success",
              amount: formatINR(yearlyRes.data.profit),
              value: yearlyRes.data.profit,
            },
            progress: processData(yearlyRes.data.sales, yearlyRes.data.profit),
          },
        ]);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <Row>
      {loading ? (
        <p style={{ padding: 20 }}>Loading sales data...</p>
      ) : (
        salesData.map((item, index) => (
          <Col key={index} xs={12} sm={6} md={6} xl={4} className="mb-4">
            <SalesPerformanceCard {...item} />
          </Col>
        ))
      )}

      <Col md={12} xl={12} style={{ marginTop: 20 }}>
        <UsersMap />
      </Col>
    </Row>
  );
}
