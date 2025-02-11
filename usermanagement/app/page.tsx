"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = "https://5lq0esn5el.execute-api.us-east-1.amazonaws.com";

// Add type safety for the user object
interface User {
  userId: string;
  username: string;
  age: string;
}

interface UserFormData {
  userId: string;
  username: string;
  age: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [newUser, setNewUser] = useState<UserFormData>({ userId: "", username: "", age: "" });
  const [updateUser, setUpdateUser] = useState<UserFormData>({ userId: "", username: "", age: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers(): Promise<void> {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/getusers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const data = await response.json();
      const usersList = JSON.parse(data.body).items;
      setUsers(usersList);
      setError("");
    } catch (err) {
      const error = err as Error;
      setError(`Error fetching users: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserById(userId: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/getUser?userId=${userId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }
      const data = await res.json();
      console.log(data);
    } catch (err) {
      const error = err as Error;
      setError(`Error fetching user: ${error.message}`);
      console.error(error);
    }
  }

  // Validate input before submitting
  async function addUser() {
    if (!newUser.userId || !newUser.username || !newUser.age) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/insertuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`Failed to add user: ${response.statusText}`);
      }

      setNewUser({ userId: "", username: "", age: "" });
      await fetchUsers();
      setError("");
    } catch (err) {
      const error = err as Error;
      setError(`Error adding user: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Validate input before updating
  async function updateUserDetails() {
    if (!updateUser.userId || !updateUser.username || !updateUser.age) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/edituser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateUser),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      setUpdateUser({ userId: "", username: "", age: "" });
      await fetchUsers();
      setError("");
    } catch (err) {
      const error = err as Error;
      setError(`Error updating user: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Add confirmation before delete
  async function deleteUser(userId: string): Promise<void> {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/deleteuser?userId=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      await fetchUsers();
      setError("");
    } catch (err) {
      const error = err as Error;
      setError(`Error deleting user: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Type the event handlers
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserFormData) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };

  const handleUpdateUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserFormData) => {
    setUpdateUser({ ...updateUser, [field]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management System</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Add User Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="User ID"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser.userId}
                onChange={(e) => handleNewUserChange(e, 'userId')}
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser.username}
                onChange={(e) => handleNewUserChange(e, 'username')}
              />
              <input
                type="number"
                placeholder="Age"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser.age}
                onChange={(e) => handleNewUserChange(e, 'age')}
              />
              <button 
                onClick={addUser}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Add User
              </button>
            </div>
          </div>

          {/* Update User Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Update User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="User ID"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={updateUser.userId}
                onChange={(e) => handleUpdateUserChange(e, 'userId')}
              />
              <input
                type="text"
                placeholder="New Username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={updateUser.username}
                onChange={(e) => handleUpdateUserChange(e, 'username')}
              />
              <input
                type="number"
                placeholder="New Age"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={updateUser.age}
                onChange={(e) => handleUpdateUserChange(e, 'age')}
              />
              <button 
                onClick={updateUserDetails}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => deleteUser(user.userId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => fetchUserById(user.userId)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
