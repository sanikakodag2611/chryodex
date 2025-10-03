import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import MainCard from 'components/MainCard';
import axios from 'axios';

const UserForm = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://127.0.0.1:8000/api/sampledata')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('GET Error:', err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://127.0.0.1:8000/api/sampledata', formData)
      .then((response) => {
        setMessage('User added successfully!');
        setFormData({ user_name: '', password: '' }); // Reset form
        fetchUsers(); // Refresh list
      })
      .catch((error) => {
        console.error('POST Error:', error);
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const errorMessages = Object.values(errors).flat().join(', ');
          setMessage(`Error: ${errorMessages}`);
        } else {
          setMessage('An error occurred.');
        }
      });
  };

  return (
    <MainCard title="User Form - POST Example">
      <Row>
        <Col md={6}>
          {message && <div style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Enter user name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </Form.Group>

            <Button type="submit" className="mb-4">
              Submit
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h5>Existing Users</h5>
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.user_name} - {user.password}</li>
            ))}
          </ul>
        </Col>
      </Row>
    </MainCard>
  );
};

export default UserForm;
