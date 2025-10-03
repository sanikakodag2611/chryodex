import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainCard from 'components/MainCard';

// Hardcoded URL to match DepartmentData.js and avoid process.env issues
const API_URL = 'http://127.0.0.1:8000';

const AddDesignation = () => {
  const [formData, setFormData] = useState({
    designation_name: '',
    designation_abbreviation: '',
    company_id: 1
  });

  const [message, setMessage] = useState('');
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.editData) {
      setFormData({
        designation_name: location.state.editData.designation_name,
        designation_abbreviation: location.state.editData.designation_abbreviation
      });
      setEditData(location.state.editData);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await axios.put(`${API_URL}/api/designation/${editData.id}`, formData);
        setMessage('Updated successfully');
      } else {
        await axios.post(`${API_URL}/api/designation`, formData);
        setMessage('Submitted successfully');
        setFormData({ designation_name: '', designation_abbreviation: '' });
      }
    } catch (error) {
      console.error('Error submitting data:', error.response || error);
      setMessage(`Error submitting data: ${error.message}`);
    }
  };

  return (
    <MainCard 
    title={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{editData ? 'Edit Designation' : 'Add Designation'}</span>
                       <Button
                        variant="primary"
                        onClick={() => navigate("/datadesignation")}
                      >
                        Designations 
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
                  <Form.Label>Designation Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="designation_name"
                    value={formData.designation_name}
                    onChange={handleChange}
                    placeholder="Enter Designation Name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Abbreviation</Form.Label>
                  <Form.Control
                    type="text"
                    name="designation_abbreviation"
                    value={formData.designation_abbreviation}
                    onChange={handleChange}
                    placeholder="Enter Abbreviation"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit">{editData ? 'Update' : 'Submit'}</Button>
          </Form>
        </Col>
      </Row>
    </MainCard>
  );
};

export default AddDesignation;