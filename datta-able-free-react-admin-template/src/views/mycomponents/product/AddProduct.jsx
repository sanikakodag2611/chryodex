import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    code: '',
    hsn_code: '',
    price: '',
    tax_rate: ''
    // company_id is fixed to 1, not included in formData
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  useEffect(() => {
    // Pre-fill form if editing
    if (editData) {
      setFormData({
        product_name: editData.product_name,
        code: editData.code,
        hsn_code: editData.hsn_code,
        price: editData.price.toString(),
        tax_rate: editData.tax_rate.toString()
        // company_id is not editable, fixed to 1
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Prepare data, fixing company_id to 1 and converting price/tax_rate to numbers
      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : '',
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : '',
        company_id: 1 // Fixed value
      };

      console.log('Submitting data:', submitData);

      const url = editData
        ? `http://127.0.0.1:8000/api/products/${editData.id}`
        : 'http://127.0.0.1:8000/api/products';
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
      setSuccess(editData ? 'Product updated successfully!' : 'Product added successfully!');
      setTimeout(() => navigate('/dataproduct'), 1500);
    } catch (error) {
      console.error('Full error:', error.response || error);
      let errorMessage = 'An error occurred while submitting the form. Please try again.';
      
      if (error.response) {
        const { data } = error.response;
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          errorMessage = errorMessages || data.message || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${error.response.status}): ${data.detail || 'Please try again.'}`;
        }
      } else if (error.request) {
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
          <span>{editData ? 'Edit Product' : 'Add Product'}</span>
          <Button
            variant="primary"
            onClick={() => navigate("/dataproduct")}
            disabled={isLoading}
          >
            Products
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
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={isLoading}
                step="0.01"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tax Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                required
                disabled={isLoading}
                step="0.01"
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
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (editData ? 'Update Product' : 'Add Product')}
        </Button>
      </Form>
    </MainCard>
  );
};

export default AddProduct;