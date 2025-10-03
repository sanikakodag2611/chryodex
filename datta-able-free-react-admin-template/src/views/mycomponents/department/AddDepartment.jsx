import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';


const AddDepartment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;

  const [formData, setFormData] = useState({
    department_name: '',
    department_abbreviation: '',
    status: 1,
    company_id: 1
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        department_name: editData.department_name || '',
        department_abbreviation: editData.department_abbreviation || '',
        status: editData.status || 1
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await axios.put(`http://127.0.0.1:8000/api/departments/${editData.id}`, formData);
        setMessage('Department updated successfully');
      } else {
        await axios.post('http://127.0.0.1:8000/api/departments', formData);
        setMessage('Department created successfully');
      }
      setTimeout(() => navigate('/datadepartment'), 1000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || 'Failed to save department'));
    }
  };

  return (
    <MainCard 
    title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{editData ? 'Edit Department' : 'Add Department'}</span>
            <Button
            variant="primary"
            onClick={() => navigate("/datadepartment")}
            >
              Departments
            </Button>
            </div>
          }
            
    >
      <Row>
        <Col md={6}>
          {message && <div style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</div>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="department_name"
                    value={formData.department_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Abbreviation</Form.Label>
                  <Form.Control
                    type="text"
                    name="department_abbreviation"
                    value={formData.department_abbreviation}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label>Company</Form.Label>
                        <Form.Control
                          type="text"
                          value="Criodex (ID: 1)"
                          disabled
                        />
                  </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit">{editData ? 'Update' : 'Submit'}</Button>
          </Form>
        </Col>
      </Row>
    </MainCard>
  );
};

export default AddDepartment;
