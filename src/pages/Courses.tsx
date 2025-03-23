import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Layout from "../components/Layout";

interface Course {
  courseID: number;
  courseName: string;
  courseDescription: string;
  courseFee: number;
  startDate: string;
  endDate: string;
  instructorID: number;
  instructorName: string;
}

interface Instructor {
  instructorID: number;
  firstName: string;
  lastName: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    fee: '',
    startDate: '',
    endDate: '',
    instructorId: '',
    month: '',
    year: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    courseID: 0,
    courseName: "",
    courseDescription: "",
    courseFee: 0,
    startDate: "",
    endDate: "",
    instructorID: 0,
    isUpdate: false,
  });

useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);
  
  useEffect(() => {
    fetchCourses();
  }, [filters]);
  

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
  
    const payload = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
  
    try {
      const response = await axios.post("https://megaverse.runasp.net/api/Course/GetCourses", payload);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const fetchInstructors = async () => {
    try {
      const response = await axios.get("https://megaverse.runasp.net/api/Instructor/GetInstructors");
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  const handleAddOrUpdateCourse = async () => {
    setLoading(true);
    setError("");

    try {
      await axios.post("https://megaverse.runasp.net/api/Course/AddOrUpdateCourse", formData);
      fetchCourses();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    setLoading(true);
    setError("");

    try {
      await axios.delete(`https://megaverse.runasp.net/api/Course/DeleteCourse/${id}`);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      courseID: 0,
      courseName: "",
      courseDescription: "",
      courseFee: 0,
      startDate: "",
      endDate: "",
      instructorID: 0,
      isUpdate: false,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Courses Management</h2>
            <button
              className="flex items-center bg-[#3CD2F9] text-white px-5 py-3 rounded-lg shadow-md 
                         hover:bg-[#32B7E3] transition duration-200 font-semibold"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} /> Add Course
            </button>
          </div>

          <div className="filters flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by course name"
              className="border p-2"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <input
              type="number"
              placeholder="Enter course fee"
              className="border p-2"
              value={filters.fee}
              onChange={(e) => setFilters({ ...filters, fee: e.target.value })}
            />
            <input
              type="date"
              className="border p-2"
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <input
              type="date"
              className="border p-2"
              placeholder="End date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <select
              className="border p-2"
              value={filters.instructorId}
              onChange={(e) => setFilters({ ...filters, instructorId: e.target.value })}
            >
              <option value="">Select Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor.instructorID} value={instructor.instructorID}>
                  {instructor.firstName} {instructor.lastName}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="border p-2"
              placeholder="Month (1-12)"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            />
            <input
              type="number"
              className="border p-2"
              placeholder="Year (e.g. 2022)"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
          </div>

          {loading && <p className="text-blue-500">Loading courses...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Course Name</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Start Date</th>
                <th className="border p-2">End Date</th>
                <th className="border p-2">Instructor</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseID} className="text-center">
                  <td className="border p-2">{course.courseID}</td>
                  <td className="border p-2">{course.courseName}</td>
                  <td className="border p-2">{course.courseDescription}</td>
                  <td className="border p-2">${course.courseFee}</td>
                  <td className="border p-2">{new Date(course.startDate).toLocaleDateString()}</td>
                  <td className="border p-2">{new Date(course.endDate).toLocaleDateString()}</td>
                  <td className="border p-2">{course.instructorName}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        setFormData({
                          ...course,
                          startDate: course.startDate.split('T')[0],
                          endDate: course.endDate.split('T')[0],
                          isUpdate: true,
                        });
                        setShowModal(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteCourse(course.courseID)}
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
              <h2 className="text-xl font-bold">{formData.isUpdate ? "Update Course" : "Add Course"}</h2>
              <input type="text" placeholder="Course Name" className="border p-2 w-full mb-2"
                value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} />
              <textarea placeholder="Course Description" className="border p-2 w-full mb-2"
                value={formData.courseDescription} onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })} />
            <input type="number" placeholder="Course Price" className="border p-2 w-full mb-2" value={formData.courseFee === 0 ? "" : formData.courseFee}
             onChange={(e) => setFormData({ ...formData, courseFee: Number(e.target.value) || 0 })} />
              <input type="date" className="border p-2 w-full mb-2"
                value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              <input type="date" className="border p-2 w-full mb-2"
                value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              <select className="border p-2 w-full mb-2"
                value={formData.instructorID} onChange={(e) => setFormData({ ...formData, instructorID: Number(e.target.value) })}>
                <option value="">Select Instructor</option>
                {instructors.map((inst) => (
                  <option key={inst.instructorID} value={inst.instructorID}>
                    {inst.firstName} {inst.lastName}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddOrUpdateCourse}>
                  {formData.isUpdate ? "Update" : "Add"}
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCloseModal}>
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

export default Courses;
