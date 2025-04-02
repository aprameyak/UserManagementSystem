"use client";

import { useState, useEffect, CSSProperties } from "react";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('API Base URL not configured');
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
  userId: string;
  username: string;
  age: number;
}

interface UserFormData {
  userId: string;
  username: string;
  age: string;
}

// Type-safe styles
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 0'
  },
  contentWrapper: {
    maxWidth: '72rem',
    margin: '0 auto',
    padding: '0 1rem'
  },
  heading: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '2rem'
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderLeft: '4px solid #ef4444',
    color: '#b91c1c',
    padding: '1rem',
    marginBottom: '1.5rem',
    borderRadius: '0 0.25rem 0.25rem 0'
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    borderLeft: '4px solid #22c55e',
    color: '#15803d',
    padding: '1rem',
    marginBottom: '1.5rem',
    borderRadius: '0 0.25rem 0.25rem 0'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
    marginBottom: '2rem'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none'
  },
  buttonPrimary: {
    width: '100%',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonUpdate: {
    width: '100%',
    backgroundColor: '#eab308',
    color: 'white',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  table: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    padding: '0.75rem 1.5rem',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  tableCell: {
    padding: '1rem 1.5rem',
    whiteSpace: 'nowrap' as const,
    fontSize: '0.875rem',
    color: '#111827'
  },
  buttonDelete: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    border: 'none',
    cursor: 'pointer',
    marginRight: '0.5rem'
  },
  buttonView: {
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    border: 'none',
    cursor: 'pointer'
  },
  loadingOverlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  loadingSpinner: {
    height: '3rem',
    width: '3rem',
    border: '4px solid #3b82f6',
    borderTop: '4px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [newUser, setNewUser] = useState<UserFormData>({ userId: "", username: "", age: "" });
  const [updateUser, setUpdateUser] = useState<UserFormData>({ userId: "", username: "", age: "" });
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserFormData) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };

  const handleUpdateUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserFormData) => {
    setUpdateUser({ ...updateUser, [field]: e.target.value });
  };

  async function fetchUsers(): Promise<void> {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/getusers`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.items || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addUser(): Promise<void> {
    if (!newUser.userId || !newUser.username || !newUser.age) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/insertuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newUser.userId,
          username: newUser.username,
          age: parseInt(newUser.age)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      setNewUser({ userId: '', username: '', age: '' });
      await fetchUsers();
      setSuccessMessage('User added successfully');
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserDetails(): Promise<void> {
    if (!updateUser.userId || !updateUser.username || !updateUser.age) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/edituser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: updateUser.userId,
          username: updateUser.username,
          age: parseInt(updateUser.age)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setUpdateUser({ userId: '', username: '', age: '' });
      await fetchUsers();
      setSuccessMessage('User updated successfully');
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/deleteuser?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      await fetchUsers();
      setSuccessMessage('User deleted successfully');
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserById(userId: string): Promise<void> {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/getuser?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }

      const data = await response.json();
      if (data.user) {
        setUpdateUser({
          userId: data.user.userId,
          username: data.user.username,
          age: data.user.age.toString()
        });
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <h1 style={styles.heading}>User Management System</h1>
        
        {error && (
          <div style={styles.errorMessage}>
            <p style={{ fontWeight: '500' }}>{error}</p>
          </div>
        )}

        {successMessage && (
          <div style={styles.successMessage}>
            <p style={{ fontWeight: '500' }}>{successMessage}</p>
          </div>
        )}

        <div style={styles.gridContainer}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Add New User</h2>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="User ID"
                style={styles.input}
                value={newUser.userId}
                onChange={(e) => handleNewUserChange(e, 'userId')}
              />
              <input
                type="text"
                placeholder="Username"
                style={styles.input}
                value={newUser.username}
                onChange={(e) => handleNewUserChange(e, 'username')}
              />
              <input
                type="number"
                placeholder="Age"
                style={styles.input}
                value={newUser.age}
                onChange={(e) => handleNewUserChange(e, 'age')}
              />
              <button 
                onClick={addUser}
                disabled={loading}
                style={{
                  ...styles.buttonPrimary,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>

          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Update User</h2>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="User ID"
                style={styles.input}
                value={updateUser.userId}
                onChange={(e) => handleUpdateUserChange(e, 'userId')}
              />
              <input
                type="text"
                placeholder="New Username"
                style={styles.input}
                value={updateUser.username}
                onChange={(e) => handleUpdateUserChange(e, 'username')}
              />
              <input
                type="number"
                placeholder="New Age"
                style={styles.input}
                value={updateUser.age}
                onChange={(e) => handleUpdateUserChange(e, 'age')}
              />
              <button 
                onClick={updateUserDetails}
                disabled={loading}
                style={{
                  ...styles.buttonUpdate,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.table}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>User ID</th>
                <th style={styles.tableHeader}>Username</th>
                <th style={styles.tableHeader}>Age</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={styles.tableCell}>{user.userId}</td>
                  <td style={styles.tableCell}>{user.username}</td>
                  <td style={styles.tableCell}>{user.age}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => deleteUser(user.userId)}
                      disabled={loading}
                      style={{
                        ...styles.buttonDelete,
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => fetchUserById(user.userId)}
                      disabled={loading}
                      style={{
                        ...styles.buttonView,
                        opacity: loading ? 0.7 : 1,
                      }}
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
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
