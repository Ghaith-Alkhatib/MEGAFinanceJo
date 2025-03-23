import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Download } from "lucide-react";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../images/MEGALogolight.png'; 

interface Expense {
  expenseID: number;
  amount: number;
  expenseDate: string;
  description: string;
  relatedEntityID: number | null;
  expenseTypeId: number;
  expenseTypeName: string;
  currency: number;
  currencyName: string;
  relatedEntityName: string;
}

interface Instructor {
  instructorID: number;
  firstName: string;
  lastName: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filters, setFilters] = useState({
    expenseType: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    sortOrder: "asc",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    expenseID: 0,
    expenseType: 1, 
    amount: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    relatedEntityID: null as number | null,
    currency: 1,
    isUpdate: false,
  });

  useEffect(() => {
    fetchExpenses();
    fetchInstructors();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      const response = await axios.post(
        "https://megaverse.runasp.net/api/Expense/GetExpenses",
        payload
      );
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError("Failed to fetch expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        "https://megaverse.runasp.net/api/Instructor/GetInstructors"
      );
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  const handleAddOrUpdateExpense = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        expenseID: formData.expenseID,
        amount: formData.amount,
        expenseDate: formData.expenseDate,
        description: formData.description,
        relatedEntityID: formData.relatedEntityID,
        expenseType: formData.expenseType,
        currency: formData.currency,
        isUpdate: formData.isUpdate,
      };

      await axios.post(
        "https://megaverse.runasp.net/api/Expense/AddOrUpdateExpense",
        payload
      );
      fetchExpenses();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    setLoading(true);
    setError("");

    try {
      await axios.delete(
        `https://megaverse.runasp.net/api/Expense/DeleteExpense/${id}`
      );
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError("Failed to delete expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      expenseID: 0,
      expenseType: 1,
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
      relatedEntityID: null,
      currency: 1,
      isUpdate: false,
    });
  };

  const handleEditExpense = (expense: Expense) => {
    setFormData({
      expenseID: expense.expenseID,
      expenseType: expense.expenseTypeId,
      amount: expense.amount,
      expenseDate: expense.expenseDate.split("T")[0],
      description: expense.description,
      relatedEntityID: expense.relatedEntityID,
      currency: expense.currency,
      isUpdate: true,
    });
    setShowModal(true);
  };

  const handleSort = () => {
    const newOrder = filters.sortOrder === "asc" ? "desc" : "asc";
    setFilters({ ...filters, sortOrder: newOrder });
  
    setExpenses((prev) =>
      [...prev].sort((a, b) => {
        if (a.amount == null || b.amount == null) return 0; 
        return newOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      })
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
  
    const imgWidth = 15; 
    const imgHeight = 15; 
    doc.addImage(logo, 'PNG', 15, 10, imgWidth, imgHeight);
  
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MEGAcerse Academy Expenses", 58, 20);
  
    const today = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(today);
    doc.text(today, pageWidth - textWidth - 10, 20);
  
    const headers = [
      "Type",
      "Amount",
      "Currency",
      "Date",
      "Description",
      "Related Entity",
    ];
    const data = expenses.map((exp) => [
      exp.expenseTypeName,
      exp.amount,
      exp.currencyName,
      new Date(exp.expenseDate).toLocaleDateString(),
      exp.description,
      exp.relatedEntityName || "N/A",
    ]);
  
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    data.push(["Total Amount", totalAmount, "", "", "", ""]);
  
    autoTable(doc, {
      startY: 30, 
      head: [headers],
      body: data,
    });
  
    doc.save("expenses.pdf");
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Expenses Management</h2>
            <button
              className="flex items-center bg-[#3CD2F9] text-white px-5 py-3 rounded-lg shadow-md hover:bg-[#32B7E3] transition duration-200 font-semibold"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} /> Add Expense
            </button>
          </div>

          <div className="filters flex flex-wrap gap-4 mb-4">
            <select
              className="border p-2"
              value={filters.expenseType}
              onChange={(e) =>
                setFilters({ ...filters, expenseType: e.target.value })
              }
            >
              <option value="">Select Expense Type</option>
              <option value="1">Instructor</option>
              <option value="2">Marketing</option>
              <option value="3">Profit</option>
              <option value="4">Operational</option>
            </select>
            <input
              type="date"
              className="border p-2"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              placeholder="Start Date"
            />
            <input
              type="date"
              className="border p-2"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              placeholder="End Date"
            />
            <input
              type="number"
              className="border p-2"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
              placeholder="Min Amount"
            />
            <input
              type="number"
              className="border p-2"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
              placeholder="Max Amount"
            />
            <button
              className="flex items-center bg-gray-200 p-2 rounded"
              onClick={handleSort}
            >
              Sort by Amount {filters.sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
            <button
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded"
              onClick={generatePDF}
            >
              <Download size={16} /> Generate PDF
            </button>
          </div>

          {loading && <p className="text-blue-500">Loading expenses...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Type</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Currency</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Related Entity</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.expenseID} className="text-center">
                  <td className="border p-2">{expense.expenseTypeName}</td>
                  <td className="border p-2">{expense.amount}</td>
                  <td className="border p-2">{expense.currencyName}</td>
                  <td className="border p-2">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{expense.description}</td>
                  <td className="border p-2">{expense.relatedEntityName || "N/A"}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteExpense(expense.expenseID)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h2 className="text-xl font-bold">
                {formData.isUpdate ? "Update Expense" : "Add Expense"}
              </h2>
              <select
                className="border p-2 w-full mb-2"
                value={formData.expenseType}
                onChange={(e) =>
                  setFormData({ ...formData, expenseType: Number(e.target.value) })
                }
              >
                <option value="1">Instructor</option>
                <option value="2">Marketing</option>
                <option value="3">Profit</option>
                <option value="4">Operational</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 w-full mb-2"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
              <select
                className="border p-2 w-full mb-2"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: Number(e.target.value) })
                }
              >
                <option value="1">USD</option>
                <option value="2">JOD</option>
              </select>
              <input
                type="date"
                className="border p-2 w-full mb-2"
                value={formData.expenseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                className="border p-2 w-full mb-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {formData.expenseType === 1 && (
                <select
                  className="border p-2 w-full mb-2"
                  value={formData.relatedEntityID || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relatedEntityID: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.instructorID} value={instructor.instructorID}>
                      {instructor.firstName} {instructor.lastName}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleAddOrUpdateExpense}
                >
                  {formData.isUpdate ? "Update" : "Add"}
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;