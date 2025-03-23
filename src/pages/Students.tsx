import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Layout from "../components/Layout";

interface Student {
  studentID: number;
  fullName: string;
  fullNameInArabic: string;
  address: string;
  email: string;
  phoneNumber: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    studentID: 0,
    fullName: "",
    fullNameInArabic: "",
    address: "",
    email: "",
    phoneNumber: "",
    isUpdate: false,
  });
  const [filters, setFilters] = useState({
    fullName: "",
    email: "",
    fullNameInArabic: "",
    address: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchStudents(filters);
  }, [filters]); // عند تغيير الفلاتر، سيتم تنفيذ البحث تلقائيًا

  const fetchStudents = async (filters: object) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://megaverse.runasp.net/api/Student/GetStudentsByFilter",
        filters
      );
      setStudents(response.data);
    } catch (error) {
      setError("Failed to fetch students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateStudent = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "https://megaverse.runasp.net/api/Student/AddOrUpdateStudent",
        formData
      );
      fetchStudents(filters); // Pass filters to keep the current filter state
      setShowModal(false);
      setFormData({
        studentID: 0,
        fullName: "",
        fullNameInArabic: "",
        address: "",
        email: "",
        phoneNumber: "",
        isUpdate: false,
      }); // إعادة تعيين formData
    } catch (error) {
      setError("Failed to save student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(
        `https://megaverse.runasp.net/api/Student/DeleteStudent/${id}`
      );
      fetchStudents(filters); // Pass filters to keep the current filter state
      if (formData.studentID === id) {
        setFormData({
          studentID: 0,
          fullName: "",
          fullNameInArabic: "",
          address: "",
          email: "",
          phoneNumber: "",
          isUpdate: false,
        }); // إعادة تعيين formData إذا تم حذف الطالب الذي يتم تحريره
      }
    } catch (error) {
      setError("Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudentClick = () => {
    setFormData({
      studentID: 0,
      fullName: "",
      fullNameInArabic: "",
      address: "",
      email: "",
      phoneNumber: "",
      isUpdate: false,
    });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
          {loading && <p className="text-blue-500">Loading students...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* Add filters section here */}
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border p-2"
              value={filters.fullName}
              onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email"
              className="border p-2"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Full Name (Arabic)"
              className="border p-2"
              value={filters.fullNameInArabic}
              onChange={(e) =>
                setFilters({ ...filters, fullNameInArabic: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Address"
              className="border p-2"
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2"
              value={filters.phoneNumber}
              onChange={(e) =>
                setFilters({ ...filters, phoneNumber: e.target.value })
              }
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
            <button
              className="flex items-center gap-2 bg-[#3CD2F9] text-white px-5 py-3 rounded-lg shadow-md hover:bg-[#32B7E3] transition duration-200 font-semibold"
              onClick={handleAddStudentClick}
            >
              <Plus size={20} /> Add Student
            </button>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Full Name</th>
                <th className="border p-2">Full Name (Arabic)</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentID} className="text-center">
                  <td className="border p-2">{student.studentID}</td>
                  <td className="border p-2">{student.fullName}</td>
                  <td className="border p-2">{student.fullNameInArabic}</td>
                  <td className="border p-2">{student.email}</td>
                  <td className="border p-2">{student.phoneNumber}</td>
                  <td className="border p-2">{student.address}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        setFormData({ ...student, isUpdate: true });
                        setShowModal(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteStudent(student.studentID)}
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
              <h2 className="text-xl font-bold mb-4">
                {formData.isUpdate ? "Update Student" : "Add Student"}
              </h2>
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 w-full mb-2"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Full Name (Arabic)"
                className="border p-2 w-full mb-2"
                value={formData.fullNameInArabic}
                onChange={(e) =>
                  setFormData({ ...formData, fullNameInArabic: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Address"
                className="border p-2 w-full mb-2"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full mb-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="border p-2 w-full mb-2"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                  onClick={handleAddOrUpdateStudent}
                >
                  {formData.isUpdate ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;