"use client";

import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from 'react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://5lq0esn5el.execute-api.us-east-1.amazonaws.com";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// API Response Types
interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

interface ApiResponse<T> {
  statusCode: number;
  body: string;
  headers: {
    [key: string]: string;
  };
}

interface LambdaResponse<T> {
  statusCode: number;
  body: T;
  headers: {
    [key: string]: string;
  };
}

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

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  if (!isOpen || !editedUser) return null;

  const handleSave = async () => {
    if (!editedUser.username.trim()) {
      setError("Username is required");
      return;
    }
    if (editedUser.age <= 0) {
      setError("Age must be greater than 0");
      return;
    }
    await onSave(editedUser);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#ff6b00', marginBottom: '1.5rem' }}>Edit User</h2>
        {error && (
          <div style={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={editedUser.username}
            onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={styles.label}>Age</label>
          <input
            type="number"
            value={editedUser.age}
            onChange={(e) => setEditedUser({ ...editedUser, age: parseInt(e.target.value) || 0 })}
            style={styles.input}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              ...styles.buttonPrimary,
              backgroundColor: '#6b7280'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={styles.buttonPrimary}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

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

// API Client
const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP error! status: ${response.status}`
          }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }
    throw new Error('Max retries reached');
  },

  async getUsers(): Promise<User[]> {
    const response = await this.request<{ items: User[] }>('/getusers');
    return response.items || [];
  },

  async addUser(user: { userId: string; username: string; age: number }): Promise<string> {
    const response = await this.request<{ message: string }>('/insertuser', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return response.message;
  },

  async updateUser(user: User): Promise<string> {
    const response = await this.request<{ message: string }>('/edituser', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return response.message;
  },

  async deleteUser(userId: string): Promise<string> {
    const response = await this.request<{ message: string }>('/deleteuser', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
    return response.message;
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [newUser, setNewUser] = useState<UserFormData>({ userId: "", username: "", age: "" });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};
    if (!newUser.userId.trim()) errors.userId = "User ID is required";
    if (!newUser.username.trim()) errors.username = "Username is required";
    if (!newUser.age || parseInt(newUser.age) <= 0) errors.age = "Age must be greater than 0";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserFormData) => {
    setNewUser({ ...newUser, [field]: e.target.value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  async function addUser(): Promise<void> {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const message = await apiClient.addUser({
        userId: newUser.userId.trim(),
        username: newUser.username.trim(),
        age: parseInt(newUser.age)
      });

      setNewUser({ userId: '', username: '', age: '' });
      await fetchUsers();
      setSuccessMessage(message || 'User added successfully');
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user';
      setError(errorMessage);
      console.error('Error adding user:', err);
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
      const message = await apiClient.deleteUser(userId);
      await fetchUsers();
      setSuccessMessage(message || 'User deleted successfully');
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSave(editedUser: User): Promise<void> {
    try {
      setLoading(true);
      const message = await apiClient.updateUser(editedUser);
      await fetchUsers();
      setSuccessMessage(message || 'User updated successfully');
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      console.error('Error updating user:', err);
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
                style={{
                  ...styles.input,
                  borderColor: formErrors.userId ? '#ef4444' : '#ffd1b3'
                }}
                value={newUser.userId}
                onChange={(e) => handleNewUserChange(e, 'userId')}
                aria-invalid={!!formErrors.userId}
                aria-describedby={formErrors.userId ? 'userId-error' : undefined}
              />
              {formErrors.userId && (
                <span id="userId-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {formErrors.userId}
                </span>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                style={{
                  ...styles.input,
                  borderColor: formErrors.username ? '#ef4444' : '#ffd1b3'
                }}
                value={newUser.username}
                onChange={(e) => handleNewUserChange(e, 'username')}
                aria-invalid={!!formErrors.username}
                aria-describedby={formErrors.username ? 'username-error' : undefined}
              />
              {formErrors.username && (
                <span id="username-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {formErrors.username}
                </span>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                style={{
                  ...styles.input,
                  borderColor: formErrors.age ? '#ef4444' : '#ffd1b3'
                }}
                value={newUser.age}
                onChange={(e) => handleNewUserChange(e, 'age')}
                aria-invalid={!!formErrors.age}
                aria-describedby={formErrors.age ? 'age-error' : undefined}
              />
              {formErrors.age && (
                <span id="age-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {formErrors.age}
                </span>
              )}
            </div>
            <button 
              onClick={addUser}
              disabled={loading || Object.keys(formErrors).length > 0}
              style={{
                ...styles.buttonPrimary,
                opacity: (loading || Object.keys(formErrors).length > 0) ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaUserPlus />
              )}
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...styles.tableCell, textAlign: 'center' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} style={styles.tableRow}>
                    <td style={styles.tableCell}>{user.userId}</td>
                    <td style={styles.tableCell}>{user.username}</td>
                    <td style={styles.tableCell}>{user.age}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => setEditingUser(user)}
                        disabled={loading}
                        style={{
                          ...styles.actionButton,
                          ...styles.editButton,
                          opacity: loading ? 0.7 : 1,
                        }}
                        title="Edit user"
                        aria-label="Edit user"
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
                        aria-label="Delete user"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner} />
        </div>
      )}

      <EditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleEditSave}
      />

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
