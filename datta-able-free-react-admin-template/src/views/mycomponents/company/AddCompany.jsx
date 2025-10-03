import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';

const AddCompany = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    country_id: '',
    state_id: '',
    city: '',
    company_address: '',
    gstin_uin: '',
    pan_no: '',
    contact_no: '',
    email: '',
    website: ''
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  useEffect(() => {
    // Fetch countries
    axios.get('http://127.0.0.1:8000/api/countries')
      .then(response => setCountries(response.data))
      .catch(error => {
        console.error('Error fetching countries:', error.response || error.message);
        setError('Failed to load countries. Please try again.');
      });

    // Pre-fill form if editing
    if (editData) {
      setFormData({
        ...editData,
        country_id: editData.country_id.toString(), // Ensure string for Form.Select
        state_id: editData.state_id.toString() // Ensure string for Form.Select
      });
    }
  }, [editData]);

  // Fetch states when country_id changes
  useEffect(() => {
    if (formData.country_id) {
      axios.get(`http://127.0.0.1:8000/api/state_country_vise/${formData.country_id}`)
        .then(response => {
          setStates(response.data.data); // Extract states from response.data.data
        })
        .catch(error => {
          console.error('Error fetching states:', error.response || error.message);
          setError('Failed to load states. Please try again.');
          setStates([]); // Clear states on error
        });
    } else {
      setStates([]); // Clear states if no country is selected
    }
  }, [formData.country_id]);

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
      // Prepare data, ensuring country_id and state_id are numbers
      const submitData = {
        ...formData,
        country_id: formData.country_id ? parseInt(formData.country_id) : '',
        state_id: formData.state_id ? parseInt(formData.state_id) : ''
      };

      // Log the data being sent for debugging
      console.log('Submitting data:', submitData);

      const url = editData
        ? `http://127.0.0.1:8000/api/company/${editData.id}`
        : 'http://127.0.0.1:8000/api/company';
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
      setSuccess(editData ? 'Company updated successfully!' : 'Company added successfully!');
      setTimeout(() => navigate('/datacompany'), 1500); // Navigate after showing success
    } catch (error) {
      console.error('Full error:', error.response || error);
      let errorMessage = 'An error occurred while submitting the form. Please try again.';
      
      if (error.response) {
        const { data } = error.response;
        if (data.errors) {
          // Handle validation errors (e.g., { errors: { company_name: ["The company name is required"] } })
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
          <span>{editData ? 'Edit Company' : 'Add Company'}</span>
          <Button
            variant="primary"
            onClick={() => navigate("/datacompany")}
            disabled={isLoading}
          >
            Companies
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
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Select
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.country_name}
                  </option>
                ))}
              </Form.Select>
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
                disabled={isLoading || !formData.country_id}
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
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Company Address</Form.Label>
              <Form.Control
                type="text"
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>GSTIN/UIN</Form.Label>
              <Form.Control
                type="text"
                name="gstin_uin"
                value={formData.gstin_uin}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>PAN No</Form.Label>
              <Form.Control
                type="text"
                name="pan_no"
                value={formData.pan_no}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Contact No</Form.Label>
              <Form.Control
                type="text"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (editData ? 'Update Company' : 'Add Company')}
        </Button>
      </Form>
    </MainCard>
  );
};

export default AddCompany;