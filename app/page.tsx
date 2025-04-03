"use client";

import { useState, useEffect, CSSProperties } from "react";
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

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

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff5eb',
    padding: '2rem 0'
  },
  contentWrapper: {
    maxWidth: '72rem',
    margin: '0 auto',
    padding: '0 1rem'
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: '2rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '3px solid #ff8534',
    paddingBottom: '0.5rem'
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
    backgroundColor: '#fff0e6',
    borderLeft: '4px solid #ff6b00',
    color: '#c74c00',
    padding: '1rem',
    marginBottom: '1.5rem',
    borderRadius: '0 0.25rem 0.25rem 0'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(255, 107, 0, 0.1), 0 2px 4px -1px rgba(255, 107, 0, 0.06)',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 107, 0, 0.1)'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ff6b00',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  formGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end'
  },
  inputGroup: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ff8534',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #ffd1b3',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  buttonPrimary: {
    backgroundColor: '#ff6b00',
    color: 'white',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  table: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(255, 107, 0, 0.1), 0 2px 4px -1px rgba(255, 107, 0, 0.06)'
  },
  tableHeader: {
    backgroundColor: '#fff5eb',
    padding: '1rem 1.5rem',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#ff6b00',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '2px solid #ffd1b3'
  },
  tableCell: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    color: '#4b5563',
    borderBottom: '1px solid #ffd1b3',
    transition: 'background-color 0.2s'
  },
  actionButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  editButton: {
    backgroundColor: '#ff8534',
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  loadingOverlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  loadingSpinner: {
    height: '3rem',
    width: '3rem',
    border: '4px solid #ff6b00',
    borderTop: '4px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  tableRow: {
    transition: 'background-color 0.2s'
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [newUser, setNewUser] = useState<UserFormData>({ userId: "", username: "", age: "" });
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

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

  async function editUser(user: User): Promise<void> {
    try {
      setLoading(true);
      const newUsername = prompt('Enter new username:', user.username);
      const newAge = prompt('Enter new age:', user.age.toString());
      
      if (!newUsername || !newAge) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/edituser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId,
          username: newUsername,
          age: parseInt(newAge)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

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

        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            <FaUserPlus />
            Add New User
          </h2>
          <div style={styles.formGroup}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>User ID</label>
              <input
                type="text"
                placeholder="Enter user ID"
                style={styles.input}
                value={newUser.userId}
                onChange={(e) => handleNewUserChange(e, 'userId')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                style={styles.input}
                value={newUser.username}
                onChange={(e) => handleNewUserChange(e, 'username')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                style={styles.input}
                value={newUser.age}
                onChange={(e) => handleNewUserChange(e, 'age')}
              />
            </div>
            <button 
              onClick={addUser}
              disabled={loading}
              style={{
                ...styles.buttonPrimary,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <FaUserPlus />
              Add User
            </button>
          </div>
        </div>

        <div style={styles.table}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <tr key={user.userId} style={styles.tableRow}>
                  <td style={styles.tableCell}>{user.userId}</td>
                  <td style={styles.tableCell}>{user.username}</td>
                  <td style={styles.tableCell}>{user.age}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => editUser(user)}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        ...styles.editButton,
                        opacity: loading ? 0.7 : 1,
                      }}
                      title="Edit user"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteUser(user.userId)}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        ...styles.deleteButton,
                        opacity: loading ? 0.7 : 1,
                      }}
                      title="Delete user"
                    >
                      <FaTrash />
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

        tr:hover {
          background-color: #fff5eb;
        }

        input:focus {
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        button:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
