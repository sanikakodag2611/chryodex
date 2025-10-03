import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';

const AddDistrict = () => {
  const [formData, setFormData] = useState({
    district_name: '',
    state_id: '',
    company_id: 1
  });
  const [states, setStates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  useEffect(() => {
    // Fetch states
    axios.get('http://127.0.0.1:8000/api/states')
      .then(response => {
        // Handle possible nested data structure
        const stateData = response.data.data || response.data;
        setStates(Array.isArray(stateData) ? stateData : []);
      })
      .catch(error => {
        console.error('Error fetching states:', error.response || error.message);
        setError('Failed to load states. Please try again.');
      });

    // Pre-fill form if editing
    if (editData) {
      setFormData({
        district_name: editData.district_name,
        state_id: editData.state_id.toString() // Ensure string for Form.Select
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Prepare data, ensuring state_id is a number
      const submitData = {
        ...formData,
        state_id: formData.state_id ? parseInt(formData.state_id) : ''
      };

      // Log the data being sent for debugging
      console.log('Submitting data:', submitData);

      const url = editData
        ? `http://127.0.0.1:8000/api/district/${editData.id}`
        : 'http://127.0.0.1:8000/api/district';
      const method = editData ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: submitData,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      console.log('API Response:', response.data);
      setSuccess(editData ? 'District updated successfully!' : 'District added successfully!');
      setTimeout(() => navigate('/datadistrict'), 1500); // Navigate after showing success
    } catch (error) {
      console.error('Full error:', error.response || error);
      let errorMessage = 'An error occurred while submitting the form. Please try again.';
      
      if (error.response) {
        const { data } = error.response;
        if (data.errors) {
          // Handle validation errors (e.g., { errors: { district_name: ["The district name is required"] } })
          const errorMessages = Object.values(data.errors).flat().join(', ');
          errorMessage = errorMessages || data.message || errorMessage;
        } else if (data.message) {
          // Handle generic error message (e.g., { message: "Invalid data" })
          errorMessage = data.message;
        } else {
          // Handle status code-based errors
          errorMessage = `Server error (${error.response.status}): ${data.detail || 'Please try again.'}`;
        }
      } else if (error.request) {
        // No response received (e.g., network error, CORS)
        errorMessage = 'No response from server. Check your network or API availability.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{editData ? 'Edit District' : 'Add District'}</span>
          <Button
            variant="primary"
            onClick={() => navigate("/datadistrict")}
            disabled={isLoading}
          >
            Districts
          </Button>
        </div>
      }
    >
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>District Name</Form.Label>
              <Form.Control
                type="text"
                name="district_name"
                value={formData.district_name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Select
                name="state_id"
                value={formData.state_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (editData ? 'Update District' : 'Add District')}
        </Button>
      </Form>
    </MainCard>
  );
};

export default AddDistrict;