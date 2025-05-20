import React, { useEffect, useState } from "react";
import API from "../services/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found, please login again.");
        return;
      }
      const res = await API.get("/admin/users", {
        headers: {Authorization: `Bearer ${token}`},
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found, please login again.");
        return;
      }
      await API.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token} `},
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  // Add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found, please login again.");
        return;
      }
      await API.post("/admin/users", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User added");
      setFormData({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard - User Management</h2>
      <form onSubmit={handleAddUser} style={{ marginBottom: 20 }}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Add User</button>
      </form>

      <h3>Users List</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: 10 }}>
            {user.name} ({user.email}) — <b>{user.role}</b>{" "}
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;