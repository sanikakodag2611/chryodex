import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BarChart = () => {
  const [formData, setFormData] = useState({
    invoice_no: '',
    date: new Date(), // Set initial date to today (September 22, 2025, 01:25 AM IST)
    customer: '',
    salesman: '', // Will be set from sessionStorage
    bill_amt: '',
    party_code: '',
    item: '',
    unit: '',
    qty: '',
    rate: '',
    amount: '',
    tax_per: '',
    tax_amt: '',
    destination: '',
    hsn_code: '',
    freight: '',
    city: '',
  });
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, unitRes, cityRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/items'),
          axios.get('http://127.0.0.1:8000/api/units'),
          axios.get('http://127.0.0.1:8000/api/cities'),
        ]);

        setItems(Array.isArray(itemRes.data.data || itemRes.data) ? (itemRes.data.data || itemRes.data) : []);
        setUnits(Array.isArray(unitRes.data.data || unitRes.data) ? (unitRes.data.data || unitRes.data) : []);
        setCities(Array.isArray(cityRes.data.data || cityRes.data) ? (cityRes.data.data || cityRes.data) : []);

        // Retrieve employee name from sessionStorage as a string
        const salesmanName = sessionStorage.getItem('employee_name') || '';

        if (editData) {
          setFormData({
            invoice_no: editData.invoice_no,
            date: editData.date ? new Date(editData.date) : new Date(),
            customer: editData.customer,
            salesman: editData.salesman || salesmanName,
            bill_amt: editData.bill_amt,
            party_code: editData.party_code,
            item: editData.item,
            unit: editData.unit,
            qty: editData.qty,
            rate: editData.rate,
            amount: editData.amount,
            tax_per: editData.tax_per,
            tax_amt: editData.tax_amt,
            destination: editData.destination,
            hsn_code: editData.hsn_code,
            freight: editData.freight,
            city: editData.city,
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            salesman: salesmanName,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error.response || error);
        setError('Failed to load data. Please try again.');
      }
    };

    fetchData();
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        date: formData.date ? formData.date.toISOString().split('T')[0] : null,
      };

      const url = editData
        ? `http://127.0.0.1:8000/api/invoice/${editData.id}`
        : 'http://127.0.0.1:8000/api/invoice';
      const method = editData ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: submitData,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('API Response:', response.data);
      setSuccess(editData ? 'Invoice updated successfully!' : 'Invoice added successfully!');
      setTimeout(() => navigate('/datalinechart'), 1500);
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
          <span>{editData ? 'Edit Invoice' : 'Add Invoice'}</span>
          <Button
            variant="primary"
            onClick={() => navigate("/datalinechart")}
            disabled={isLoading}
          >
            Invoices
          </Button>
        </div>
      }
    >
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-center">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Invoice No</Form.Label>
              <Form.Control
                type="text"
                name="invoice_no"
                value={formData.invoice_no}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label><br/>
              <DatePicker
                selected={formData.date}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Control
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Salesman</Form.Label>
              <Form.Control
                type="text"
                name="salesman"
                value={formData.salesman}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Bill Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                name="bill_amt"
                value={formData.bill_amt}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Party Code</Form.Label>
              <Form.Control
                type="text"
                name="party_code"
                value={formData.party_code}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Item</Form.Label>
              <Form.Select
                name="item"
                value={formData.item}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.item_name}>
                    {item.item_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.unit_name}>
                    {unit.unit_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Rate (₹)</Form.Label>
              <Form.Control
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tax Percentage (%)</Form.Label>
              <Form.Control
                type="number"
                name="tax_per"
                value={formData.tax_per}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                max="100"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tax Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                name="tax_amt"
                value={formData.tax_amt}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                name="destination"
                value={formData.destination}
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
              <Form.Label>Freight (₹)</Form.Label>
              <Form.Control
                type="number"
                name="freight"
                value={formData.freight}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.city_name}>
                    {city.city_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (editData ? 'Update Invoice' : 'Add Invoice')}
        </Button>
      </Form>
    </MainCard>
  );
};

export default BarChart;