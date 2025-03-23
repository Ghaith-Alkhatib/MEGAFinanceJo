import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import axios from "axios";
import Layout from "../components/Layout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardData {
  totalRevenues: { totalRevenue: number; currency: string }[];
  totalExpenses: { totalExpenses: number; currency: string }[];
  netProfit: { netProfitUSD: number; netProfitJOD: number };
  totalStudents: number;
  totalActiveCourses: number;
  totalPayments: number;
  totalPaymentsAmount: { totalPaymentsAmount: number; currency: string }[];
  latestPayments: {
    paymentID: number;
    studentID: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    currency: string;
  }[];
  latestExpenses: {
    expenseID: number;
    expenseType: string;
    amount: number;
    expenseDate: string;
    currency: string;
    description: string;
  }[];
  latestRevenues: {
    revenueID: number;
    revenueType: string;
    amount: number;
    revenueDate: string;
    currency: string;
    description: string;
  }[];
  topStudents: {
    studentID: number;
    fullName: string;
    totalCoursesRegistered: number;
  }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DashboardData>(
          "https://megaverse.runasp.net/api/Dashboard/GetDashboardStatistics"
        );
        setData(response.data);
      } catch (err) {
        setError("Failed to fetch dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No data available.</p>;

  // إعداد بيانات الرسوم البيانية
  const revenueChartData = {
    labels: data.totalRevenues.map((rev) => rev.currency),
    datasets: [
      {
        label: "Total Revenues",
        data: data.totalRevenues.map((rev) => rev.totalRevenue),
        backgroundColor: ["#36A2EB", "#4BC0C0"],
      },
    ],
  };

  const expenseChartData = {
    labels: data.totalExpenses.map((exp) => exp.currency),
    datasets: [
      {
        label: "Total Expenses",
        data: data.totalExpenses.map((exp) => exp.totalExpenses),
        backgroundColor: ["#FF6384", "#FF9F40"],
      },
    ],
  };

  const netProfitChartData = {
    labels: ["USD", "JOD"],
    datasets: [
      {
        label: "Net Profit",
        data: [data.netProfit.netProfitUSD, data.netProfit.netProfitJOD],
        backgroundColor: ["#9966FF", "#C9CBCF"],
      },
    ],
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

        {/* إجمالي الإيرادات والمصاريف */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Total Revenues</h2>
            <Bar data={revenueChartData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Total Expenses</h2>
            <Bar data={expenseChartData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Net Profit</h2>
            <Pie data={netProfitChartData} />
          </div>
        </div>

        {/* إحصائيات عامة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Students</h2>
            <p className="text-3xl font-bold text-blue-600">{data.totalStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Active Courses</h2>
            <p className="text-3xl font-bold text-green-600">{data.totalActiveCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Payments</h2>
            <p className="text-3xl font-bold text-purple-600">{data.totalPayments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Payments Amount</h2>
            <div>
              {data.totalPaymentsAmount.map((payment) => (
                <p key={payment.currency} className="text-lg">
                  {payment.totalPaymentsAmount} {payment.currency}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* أحدث المدفوعات والمصاريف والإيرادات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Latest Payments</h2>
            <ul>
              {data.latestPayments.map((payment) => (
                <li key={payment.paymentID} className="mb-2">
                  <p>
                    <span className="font-semibold">{payment.amount} {payment.currency}</span> - {payment.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Latest Expenses</h2>
            <ul>
              {data.latestExpenses.map((expense) => (
                <li key={expense.expenseID} className="mb-2">
                  <p>
                    <span className="font-semibold">{expense.amount} {expense.currency}</span> - {expense.expenseType}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Latest Revenues</h2>
            <ul>
              {data.latestRevenues.map((revenue) => (
                <li key={revenue.revenueID} className="mb-2">
                  <p>
                    <span className="font-semibold">{revenue.amount} {revenue.currency}</span> - {revenue.revenueType}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(revenue.revenueDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* أعلى 3 طلاب */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 3 Students</h2>
          <ul>
            {data.topStudents.map((student) => (
              <li key={student.studentID} className="mb-2">
                <p className="font-semibold">{student.fullName}</p>
                <p className="text-sm text-gray-500">Courses Registered: {student.totalCoursesRegistered}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;