import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RecordList.css"; // Import your CSS file
import { FaEdit, FaTrash } from "react-icons/fa"; // Example with Font Awesome
import { useNavigate } from "react-router-dom";
const RecordList = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleEdit = (record) => {
    setSelectedRecord(record);
    navigate("/dashboard", { state: { record } }); // Pass selected record to dashboard
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`http://localhost:3001/api/records/${id}`, config);

      // Update state or re-fetch records to reflect changes
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id && record._id !== id)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      // Handle error
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          "http://localhost:3001/api/records",
          config
        );
        setRecords(response.data.data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="record-list-container">
      <h2>Record List</h2>
      <table className="record-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id || record._id}>
              <td>{record.type}</td>
              <td>{record.amount}</td>
              <td>{record.description}</td>
              <td>
                <span className="action-icons">
                  <FaEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEdit(record)}
                  />
                  <FaTrash
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(record.id || record._id)}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordList;
