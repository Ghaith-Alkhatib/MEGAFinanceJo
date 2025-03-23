import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import paymentReceiptImage from "../pictures/PaymentReceipt.jpg";

const imagePath = paymentReceiptImage;

interface Student {
  studentID: number;
  fullName: string;
}

interface Course {
  courseID: number;
  courseName: string;
}

interface Payment {
  paymentID: number;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethodName: string;
  currencyName: string;
  fileID: string | null;
  fileName: string | null;
  courseName: string;
}

const Payments: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filters, setFilters] = useState({
    courseID: "",
    studentID: "",
    paymentMethod: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    paymentID: 0,
    studentID: 0,
    amount: 0,
    currency: 1,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: 1,
    fileID: null as string | null,
    courseID: 0,
    isUpdate: false,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchPayments();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      const response = await axios.post(
        "https://megaverse.runasp.net/api/Student/GetStudentsByFilter",
        {}
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.post(
        "https://megaverse.runasp.net/api/Course/GetCourses",
        {}
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      const response = await axios.post(
        "https://megaverse.runasp.net/api/Payment/GetPaymentsByFilter",
        payload
      );
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdatePayment = async () => {
    setLoading(true);
    setError("");

    try {
      let fileId = formData.fileID;
      if (file) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        const fileResponse = await axios.post(
          "https://megaverse.runasp.net/api/File/Upload",
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fileId = fileResponse.data.uuid;
      }

      await axios.post(
        "https://megaverse.runasp.net/api/Payment/AddOrUpdatePayment",
        { ...formData, fileID: fileId }
      );
      fetchPayments();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving payment:", error);
      setError("Failed to save payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id: number) => {
    setLoading(true);
    setError("");

    try {
      await axios.delete(
        `https://megaverse.runasp.net/api/Payment/DeletePayment/${id}`
      );
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      setError("Failed to delete payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      paymentID: 0,
      studentID: 0,
      amount: 0,
      currency: 1,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: 1,
      fileID: null,
      courseID: 0,
      isUpdate: false,
    });
    setFile(null); // إعادة تعيين الملف المرفق
  };

  const handleEditPayment = (payment: Payment) => {
    setFormData({
      paymentID: payment.paymentID,
      studentID: students.find((s) => s.fullName === payment.studentName)?.studentID || 0,
      amount: payment.amount,
      currency: payment.currencyName === "USD" ? 1 : 2,
      paymentDate: payment.paymentDate.split("T")[0],
      paymentMethod:
        payment.paymentMethodName === "CliQ"
          ? 1
          : payment.paymentMethodName === "PayPal"
          ? 2
          : payment.paymentMethodName === "Cash"
          ? 3
          : 4,
      fileID: payment.fileID,
      courseID: courses.find((c) => c.courseName === payment.courseName)?.courseID || 0,
      isUpdate: true,
    });

    // جلب الملف المرفق (إن وجد)
    if (payment.fileName) {
      axios.get(`https://megaverse.runasp.net/api/File/Download/${payment.fileName}`, {
        responseType: 'blob'
      }).then(response => {
        const file = new File([response.data], payment.fileName || "file", { type: response.data.type });
        setFile(file);
      }).catch(error => {
        console.error("Error fetching file:", error);
      });
    } else {
      setFile(null);
    }

    setShowModal(true);
  };

  const generateReceiptPDF = async (payment: Payment) => {
    const receiptContent = document.createElement("div");
    receiptContent.style.position = "absolute";
    receiptContent.style.left = "-9999px"; // إخفاء العنصر عن الشاشة
    receiptContent.style.width = "700px"; // عرض العنصر (بحجم A4 بالميليمتر)
    receiptContent.style.height = "595px"; // ارتفاع العنصر (بحجم A4 بالميليمتر)
    receiptContent.style.backgroundImage = `url(${imagePath})`; // تعيين الصورة كخلفية
    receiptContent.style.backgroundSize = "contain"; // عرض الصورة بالكامل دون قص
    receiptContent.style.backgroundRepeat = "no-repeat"; // منع تكرار الصورة
    receiptContent.style.backgroundPosition = "center"; // توسيط الصورة
    receiptContent.style.padding = "20px"; 
    receiptContent.style.fontFamily = "Arial, sans-serif"; 

    // تحديد مواضع الحقول بدقة مع تعديل الأنماط
    receiptContent.innerHTML = `
      <div style="position: absolute; top: 137px; left: 87px; color: #000000; font-size: 17px; font-weight: bold;">
        <p>${new Date(payment.paymentDate).toLocaleDateString()}</p>
      </div>
      <div style="position: absolute; top: 190px; left: 130px; color: #000000; font-size: 17px; font-weight: bold;">
        <p>${payment.studentName}</p>
      </div>
      <div style="position: absolute; top: 244px; left: 117px; color: #000000; font-size: 17px; font-weight: bold;">
        <p>${payment.amount} ${payment.currencyName}</p>
      </div>
      <div style="position: absolute; top: 350px; left: 120px; color: #000000; font-size: 17px; font-weight: bold;">
        <p>${payment.courseName}</p>
      </div>
      <div style="position: absolute; top: 298px; left: 195px; color: #000000; font-size: 17px; font-weight: bold;">
        <p>${payment.paymentMethodName}</p>
      </div>
    `;

    document.body.appendChild(receiptContent);

    const canvas = await html2canvas(receiptContent, {
      scale: 1, // عدم تكبير الصورة
      useCORS: true, // السماح بتحميل الصور من مصادر خارجية
    });

    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF("p", "mm", "a4"); // A4 حجم الصفحة
    const imgWidth = 210; // عرض الصفحة A4 بالميليمتر
    const imgHeight = ((canvas.height * imgWidth) / canvas.width); // تقليل الارتفاع بنسبة 20%  
    // إضافة الصورة إلى PDF بحجمها الطبيعي
    doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight); // إضافة الصورة إلى PDF
    doc.save(`Receipt_${payment.paymentID}.pdf`); // حفظ الملف

    document.body.removeChild(receiptContent);
  };

  const handlePrintReceipt = (payment: Payment) => {
    generateReceiptPDF(payment);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Payments Management</h2>
            <button
              className="flex items-center bg-[#3CD2F9] text-white px-5 py-3 rounded-lg shadow-md hover:bg-[#32B7E3] transition duration-200 font-semibold"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} /> Add Payment
            </button>
          </div>

          <div className="filters flex flex-wrap gap-4 mb-4">
            <select
              className="border p-2"
              value={filters.courseID}
              onChange={(e) =>
                setFilters({ ...filters, courseID: e.target.value })
              }
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.courseID} value={course.courseID}>
                  {course.courseName}
                </option>
              ))}
            </select>
            <select
              className="border p-2"
              value={filters.studentID}
              onChange={(e) =>
                setFilters({ ...filters, studentID: e.target.value })
              }
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.studentID} value={student.studentID}>
                  {student.fullName}
                </option>
              ))}
            </select>
            <select
              className="border p-2"
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters({ ...filters, paymentMethod: e.target.value })
              }
            >
              <option value="">Select Payment Method</option>
              <option value="1">CliQ</option>
              <option value="2">PayPal</option>
              <option value="3">Cash</option>
              <option value="4">CreditCard</option>
            </select>
          </div>

          {loading && <p className="text-blue-500">Loading payments...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Student</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Currency</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Method</th>
                <th className="border p-2">File</th>
                <th className="border p-2">Course</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentID} className="text-center">
                  <td className="border p-2">{payment.studentName}</td>
                  <td className="border p-2">{payment.amount}</td>
                  <td className="border p-2">{payment.currencyName}</td>
                  <td className="border p-2">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{payment.paymentMethodName}</td>
                  <td className="border p-2">
                    {payment.fileName && (
                      <div className="flex space-x-2">
                        <a
                          href={`https://megaverse.runasp.net/api/File/Download/${payment.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Download
                        </a>
                        <a
                          href={`https://megaverse.runasp.net/api/File/View/${payment.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:underline"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="border p-2">{payment.courseName}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEditPayment(payment)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeletePayment(payment.paymentID)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handlePrintReceipt(payment)}
                    >
                      Print Receipt
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
                {formData.isUpdate ? "Update Payment" : "Add Payment"}
              </h2>
              <select
                className="border p-2 w-full mb-2"
                value={formData.studentID}
                onChange={(e) =>
                  setFormData({ ...formData, studentID: Number(e.target.value) })
                }
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.studentID} value={student.studentID}>
                    {student.fullName}
                  </option>
                ))}
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
                <option value={1}>USD</option>
                <option value={2}>JOD</option>
              </select>
              <input
                type="date"
                className="border p-2 w-full mb-2"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
              />
              <select
                className="border p-2 w-full mb-2"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: Number(e.target.value),
                  })
                }
              >
                <option value={1}>CliQ</option>
                <option value={2}>PayPal</option>
                <option value={3}>Cash</option>
                <option value={4}>CreditCard</option>
              </select>
              <input
                type="file"
                className="border p-2 w-full mb-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <select
                className="border p-2 w-full mb-2"
                value={formData.courseID}
                onChange={(e) =>
                  setFormData({ ...formData, courseID: Number(e.target.value) })
                }
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.courseID} value={course.courseID}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleAddOrUpdatePayment}
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

export default Payments;