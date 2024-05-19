// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./Dashboard.css";
// import { useLocation } from "react-router-dom";

// const Dashboard = () => {
//   const [formData, setFormData] = useState({
//     type: "income", // Default type is income
//     amount: "",
//     description: "",
//   });
//   const [errors, setErrors] = useState({});
//   //const navigate = useNavigate();
//   const location = useLocation();
//   const { record } = location.state || {};

//   useEffect(() => {
//     if (record) {
//       // If record data is passed, populate the form fields with it
//       setFormData({
//         type: record.type,
//         amount: record.amount,
//         description: record.description,
//       });
//     }
//   }, [record]);
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [name]: "", // Clear error message when user starts typing
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Perform client-side validation
//     const validationErrors = {};
//     if (!formData.amount) {
//       validationErrors.amount = "Amount is required";
//     } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
//       validationErrors.amount = "Invalid amount format";
//     }
//     if (!formData.description) {
//       validationErrors.description = "Description is required";
//     }
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       // Include token in request headers
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };

//       if (record) {
//         // If record data is passed, call the update API (PUT)
//         await axios.put(
//           `http://localhost:3001/api/recordsUp/${record._id}`,
//           formData,
//           config
//         );
//         // Show success message for update
//         alert("Record updated successfully!");
//       } else {
//         // If no record data is passed, call the create API (POST)
//         const response = await axios.post(
//           "http://localhost:3001/api/records",
//           formData,
//           config
//         );
//         // Show success message for add
//         console.log("Response:", response.data);
//         alert("Record added successfully!");
//       }

//       // Reset form data after successful submission
//       setFormData({
//         type: "income", // Reset type to income
//         amount: "",
//         description: "",
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       if (error.response && error.response.data && error.response.data.error) {
//         alert(error.response.data.error);
//       } else {
//         alert("An error occurred. Please try again later.");
//       }
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <h2>{record ? "Update Record" : "Add Record"}</h2>
//       <form onSubmit={handleSubmit} className="record-form">
//         <div className="form-group">
//           <label htmlFor="type">Type:</label>
//           <select
//             id="type"
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//           >
//             <option value="income">Income</option>
//             <option value="expense">Expense</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <label htmlFor="amount">Amount:</label>
//           <input
//             type="text"
//             id="amount"
//             name="amount"
//             value={formData.amount}
//             onChange={handleChange}
//             required
//           />
//           {errors.amount && <span className="error">{errors.amount}</span>}
//         </div>
//         <div className="form-group">
//           <label htmlFor="description">Description:</label>
//           <input
//             type="text"
//             id="description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             required
//           />
//           {errors.description && (
//             <span className="error">{errors.description}</span>
//           )}
//         </div>
//         <button type="submit">{record ? "Update" : "Submit"}</button>
//       </form>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";

const useRequireAuth = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // If token does not exist, redirect to login page
      navigate("/login");
    }
  }, [token, navigate]);

  return token;
};

const Dashboard = () => {
  const [formData, setFormData] = useState({
    type: "income", // Default type is income
    amount: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { record } = location.state || {};
  const token = useRequireAuth(); // Custom hook for authentication

  useEffect(() => {
    if (record) {
      // If record data is passed, populate the form fields with it
      setFormData({
        type: record.type,
        amount: record.amount,
        description: record.description,
      });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message when user starts typing
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform client-side validation
    const validationErrors = {};
    if (!formData.amount) {
      validationErrors.amount = "Amount is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      validationErrors.amount = "Invalid amount format";
    }
    if (!formData.description) {
      validationErrors.description = "Description is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Include token in request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (record) {
        // If record data is passed, call the update API (PUT)
        console.log(`Updating record with ID: ${record.id}`);
        const response = await axios.put(
          `http://localhost:3001/api/records/${record.id}`,
          formData,
          config
        );
        // Show success message for update
        console.log("Update Response:", response.data);
        alert("Record updated successfully!");
      } else {
        // If no record data is passed, call the create API (POST)
        const response = await axios.post(
          "http://localhost:3001/api/records",
          formData,
          config
        );
        // Show success message for add
        console.log("Response:", response.data);
        alert("Record added successfully!");
      }

      // Reset form data after successful submission
      setFormData({
        type: "income", // Reset type to income
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h2>{record ? "Update Record" : "Add Record"}</h2>
      <form onSubmit={handleSubmit} className="record-form">
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
        </div>
        <button type="submit">{record ? "Update" : "Submit"}</button>
      </form>
    </div>
  );
};

export default Dashboard;
