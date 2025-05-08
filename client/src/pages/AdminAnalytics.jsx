import React, { useState, useEffect } from "react";
import {
  getTopSoldProducts,
  getTopRatedProducts,
  getYearlyTurnover,
  getMonthlyTurnover,
  getTopCustomers,
} from "../api";
import { LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, Bar, ResponsiveContainer } from "recharts";
import { Loader, AlertCircle, DollarSign, ShoppingBag, Star, Users, TrendingUp } from "lucide-react";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearlyTurnover, setYearlyTurnover] = useState([]);
  const [monthlyTurnover, setMonthlyTurnover] = useState([]);
  const [topSoldProducts, setTopSoldProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("sales"); // Changed default to "sales"

  // Month names for conversion
  const monthNames = React.useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  // Fetch all data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          yearlyRes,
          monthlyRes,
          topSoldRes,
          topRatedRes,
          topCustomersRes
        ] = await Promise.all([
          getYearlyTurnover(),
          getMonthlyTurnover(),
          getTopSoldProducts(),
          getTopRatedProducts(),
          getTopCustomers()
        ]);

        // Set state with responses
        setYearlyTurnover(yearlyRes.data);
        setMonthlyTurnover(monthlyRes.data.map(item => ({
          ...item,
          monthName: monthNames[item.month - 1]
        })));
        setTopSoldProducts(topSoldRes.data);
        setTopRatedProducts(topRatedRes.data);
        setTopCustomers(topCustomersRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Failed to load analytics data. Please check your connection and try again.");
        
        // Check for auth errors
        if (err.response && err.response.status === 401) {
          setError("Authentication error. Please log in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [monthNames]);

  // Calculate total yearly revenue for overview
  const totalYearlyRevenue = yearlyTurnover.reduce((sum, item) => sum + item.total, 0);
  
  // Get current year's revenue
  const currentYear = new Date().getFullYear();
  const currentYearRevenue = yearlyTurnover.find(item => item.year === currentYear)?.total || 0;
  
  // Get total products sold
  const totalProductsSold = topSoldProducts.reduce((sum, product) => sum + product.sold, 0);

  // Loading state
  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="loading-icon" size={48} />
        <h2>Loading Analytics Dashboard...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="analytics-error">
        <AlertCircle className="error-icon" size={48} />
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights into your e-commerce performance</p>
      </div>

      {/* Navigation Tabs - Removed overview tab */}
      <div className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          Sales Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Product Insights
        </button>
        <button 
          className={`tab-button ${activeTab === "customers" ? "active" : ""}`}
          onClick={() => setActiveTab("customers")}
        >
          Customer Analysis
        </button>
      </div>

      {/* Sales Analytics Tab - Now includes content from overview tab */}
      {activeTab === "sales" && (
        <div className="analytics-sales">
          {/* Stats Cards - Moved from overview */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon revenue-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{totalYearlyRevenue.toLocaleString()}</p>
                <p className="stat-label">Lifetime</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon current-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>Current Year</h3>
                <p className="stat-value">₹{currentYearRevenue.toLocaleString()}</p>
                <p className="stat-label">{currentYear} Revenue</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon products-icon">
                <ShoppingBag size={24} />
              </div>
              <div className="stat-content">
                <h3>Products Sold</h3>
                <p className="stat-value">{totalProductsSold.toLocaleString()}</p>
                <p className="stat-label">Total Units</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon customers-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3>Top Customers</h3>
                <p className="stat-value">{topCustomers.length}</p>
                <p className="stat-label">Active Buyers</p>
              </div>
            </div>
          </div>

          {/* Yearly Revenue Chart - Moved from overview */}
          <div className="chart-container">
            <h2>Yearly Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTurnover}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Revenue" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Chart - Moved from overview */}
          <div className="chart-container">
            <h2>Monthly Revenue (Current Year)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTurnover}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  name="Monthly Revenue" 
                  fill="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="metrics-container">
            <div className="metric-card">
              <h3>Average Monthly Revenue</h3>
              <p className="metric-value">
                ₹{(monthlyTurnover.reduce((sum, month) => sum + month.total, 0) / 
                  (monthlyTurnover.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="metric-card">
              <h3>Highest Monthly Revenue</h3>
              <p className="metric-value">
                ₹{Math.max(...monthlyTurnover.map(month => month.total), 0).toLocaleString()}
              </p>
              <p className="metric-detail">
                {monthlyTurnover.length > 0 ? 
                  monthlyTurnover.reduce((prev, current) => 
                    (prev.total > current.total) ? prev : current).monthName : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Insights Tab */}
      {activeTab === "products" && (
        <div className="analytics-products">
          <div className="adminanal-product-grid">
            <div className="product-section">
              <h2>Top Selling Products</h2>
              <div className="product-list">
                {topSoldProducts.map((product, index) => (
                  <div key={product._id} className="adminanal-product-card">
                    <div className="product-rank">{index + 1}</div>
                    <div className="ad-product-image">
                      {product.image ? (
                        <img src={`http://localhost:5000/uploads/products/${product.image}`} alt={product.name} />
                      ) : (
                        <ShoppingBag size={32} />
                      )}
                    </div>
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price}</p>
                      <p className="product-sold">
                        <span className="highlight">{product.sold}</span> units sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-section">
              <h2>Top Rated Products</h2>
              <div className="product-list">
                {topRatedProducts.map((product, index) => (
                  <div key={product.productId} className="adminanal-product-card">
                    <div className="product-rank">{index + 1}</div>
                    <div className="ad-product-image">
                      {product.image ? (
                        <img src={`http://localhost:5000/uploads/products/${product.image}`} alt={product.name} />
                      ) : (
                        <Star size={32} />
                      )}
                    </div>
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <div className="rating">
                        <div className="stars" style={{ 
                          '--rating': product.averageRating 
                        }}></div>
                        <span className="rating-value">
                          {product.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="product-reviews">
                        Based on <span className="highlight">{product.totalRatings}</span> reviews
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h2>Top Products by Sales Volume</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={topSoldProducts.slice(0, 5).map(product => ({
                  name: product.name,
                  sold: product.sold,
                  shortName: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name
                }))} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="shortName" 
                  width={100}
                />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Units Sold']}
                  labelFormatter={(name) => {
                    const product = topSoldProducts.find(p => p.name.startsWith(name.replace('...', '')));
                    return product ? product.name : name;
                  }}
                />
                <Legend />
                <Bar dataKey="sold" name="Units Sold" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Customer Analysis Tab */}
      {activeTab === "customers" && (
        <div className="analytics-customers">
          <h2>Top 10 Most Active Customers</h2>
          <div className="customers-table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td className="rank-cell">{index + 1}</td>
                    <td>{customer.name}</td>
                    <td className="email-cell">{customer.email}</td>
                    <td className="center-cell">{customer.ordersCount}</td>
                    <td className="amount-cell">₹{customer.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-container">
            <h2>Customer Spending Distribution</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={topCustomers.slice(0, 5).map(customer => ({
                  name: customer.name,
                  spent: customer.totalSpent,
                  orders: customer.ordersCount
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => {
                  if (name === "Total Spent") return [`₹${value.toLocaleString()}`, name];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="spent" name="Total Spent" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="orders" name="Order Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="customer-metrics">
            <div className="metric-card">
              <h3>Average Orders per Customer</h3>
              <p className="metric-value">
                {(topCustomers.reduce((sum, customer) => sum + customer.ordersCount, 0) / 
                  (topCustomers.length || 1)).toFixed(1)}
              </p>
            </div>
            <div className="metric-card">
              <h3>Average Spend per Customer</h3>
              <p className="metric-value">
                ₹{(topCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0) / 
                  (topCustomers.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="metric-card">
              <h3>Highest Spending Customer</h3>
              <p className="metric-value">
                ₹{Math.max(...topCustomers.map(customer => customer.totalSpent), 0).toLocaleString()}
              </p>
              <p className="metric-detail">
                {topCustomers.length > 0 ? 
                  topCustomers.reduce((prev, current) => 
                    (prev.totalSpent > current.totalSpent) ? prev : current).name : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;