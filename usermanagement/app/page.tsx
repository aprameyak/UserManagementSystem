"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = "https://your-api-gateway-url";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ userId: "", username: "", age: "" });
  const [updateUser, setUpdateUser] = useState({ userId: "", username: "", age: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch(`${API_BASE_URL}/getAllUsers`);
    const data = await res.json();
    setUsers(data);
  }

  async function fetchUserById(userId) {
    const res = await fetch(`${API_BASE_URL}/getUser?userId=${userId}`);
    const data = await res.json();
    console.log(data);
  }

  async function addUser() {
    await fetch(`${API_BASE_URL}/addUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setNewUser({ userId: "", username: "", age: "" });
    fetchUsers();
  }

  async function updateUserDetails() {
    await fetch(`${API_BASE_URL}/updateUser?userId=${updateUser.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: updateUser.username, age: updateUser.age }),
    });
    setUpdateUser({ userId: "", username: "", age: "" });
    fetchUsers();
  }

  async function deleteUser(userId) {
    await fetch(`${API_BASE_URL}/deleteUser?userId=${userId}`, { method: "DELETE" });
    fetchUsers();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="User ID"
          className="border p-2 mr-2"
          value={newUser.userId}
          onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Username"
          className="border p-2 mr-2"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          className="border p-2 mr-2"
          value={newUser.age}
          onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
        />
        <button onClick={addUser} className="bg-blue-500 text-white px-4 py-2">
          Add User
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="User ID"
          className="border p-2 mr-2"
          value={updateUser.userId}
          onChange={(e) => setUpdateUser({ ...updateUser, userId: e.target.value })}
        />
        <input
          type="text"
          placeholder="New Username"
          className="border p-2 mr-2"
          value={updateUser.username}
          onChange={(e) => setUpdateUser({ ...updateUser, username: e.target.value })}
        />
        <input
          type="number"
          placeholder="New Age"
          className="border p-2 mr-2"
          value={updateUser.age}
          onChange={(e) => setUpdateUser({ ...updateUser, age: e.target.value })}
        />
        <button onClick={updateUserDetails} className="bg-yellow-500 text-white px-4 py-2">
          Update User
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">User ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Age</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId} className="border">
              <td className="border p-2">{user.userId}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.age}</td>
              <td className="border p-2">
                <button
                  onClick={() => deleteUser(user.userId)}
                  className="bg-red-500 text-white px-3 py-1 mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => fetchUserById(user.userId)}
                  className="bg-green-500 text-white px-3 py-1"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
