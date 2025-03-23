import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

// Placeholder for the actual service - you'll need to create this file
const userService = {
  getAllUsers: () => {
    // Simulate API call with mock data for now
    return Promise.resolve({
      data: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
        { id: 2, name: 'Regular User', email: 'user@example.com', role: 'USER' },
        { id: 3, name: 'Manager', email: 'manager@example.com', role: 'MANAGER' }
      ]
    });
  },
  updateUserRole: (userId, role) => {
    // Simulate API call
    console.log(`Updating user ${userId} to role ${role}`);
    return Promise.resolve({ data: { id: userId, role } });
  }
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  
  // Get mock currentUser for now
  const currentUser = { id: 1, role: 'ADMIN' };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      console.log('Users data:', response.data);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user, role) => {
    setSelectedUser(user);
    setNewRole(role);
    setDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) {
      setDialogOpen(false);
      return;
    }

    try {
      await userService.updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      
      setSuccessMessage(`${selectedUser.name || selectedUser.email}'s role was changed to ${newRole}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update user role. Please try again.');
    }
    
    setDialogOpen(false);
  };

  const getRoleColor = (role) => {
    if (role === 'ADMIN') return 'error';
    if (role === 'MANAGER') return 'warning';
    return 'primary';
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : users.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role || 'USER'} 
                      color={getRoleColor(user.role)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {currentUser.id !== user.id ? (
                      <FormControl variant="outlined" size="small">
                        <Select
                          displayEmpty
                          value=""
                          renderValue={() => "Change Role"}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                        >
                          <MenuItem value="ADMIN" disabled={user.role === 'ADMIN'}>
                            Make Admin
                          </MenuItem>
                          <MenuItem value="MANAGER" disabled={user.role === 'MANAGER'}>
                            Make Manager
                          </MenuItem>
                          <MenuItem value="USER" disabled={user.role === 'USER'}>
                            Make User
                          </MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        (Current User)
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No users found.
          </Typography>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Role Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change {selectedUser?.name || selectedUser?.email || 'this user'}'s 
            role from {selectedUser?.role || 'current role'} to {newRole}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmRoleChange} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPage;