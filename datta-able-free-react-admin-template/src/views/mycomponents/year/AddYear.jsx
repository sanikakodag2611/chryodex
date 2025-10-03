import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import MainCard from 'components/MainCard';

const AddYear = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;
  const comp_id=sessionStorage.getItem('company_id');

  const [formData, setFormData] = useState({
    year_name: '',
    year_abbreviation: '',
    opening_date: '',
    closing_date: '',
    status: 1,
    company_id: comp_id
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        opening_date: formatDate(editData.opening_date),
        closing_date: formatDate(editData.closing_date)
      });
    }
  }, [editData]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'status' ? parseInt(value) : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await axios.put(`http://127.0.0.1:8000/api/years/${editData.id}`, formData);
        setMessage('Year updated successfully');
      } else {
        await axios.post('http://127.0.0.1:8000/api/years', formData);
        setMessage('Year created successfully');
      }
      navigate('/datayear');
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  };

  return (
    <MainCard 
    title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{editData ? 'Edit Year' : 'Add Year'}</span>
                           <Button
                            variant="primary"
                            onClick={() => navigate("/datayear")}
                          >
                            Years 
                          </Button>
            </div>
          }
    >
    <Row>
        <Col md={12}>
        {message && (
            <div style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</div>
        )}
        <Form onSubmit={handleSubmit}>
            {/* Row 1: Year Name & Abbreviation */}
            <Row className="mb-3">
            <Col md={6}>
                <Form.Group>
                <Form.Label>Year Name</Form.Label>
                <Form.Control
                    type="text"
                    name="year_name"
                    value={formData.year_name}
                    onChange={handleChange}
                />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                <Form.Label>Abbreviation</Form.Label>
                <Form.Control
                    type="text"
                    name="year_abbreviation"
                    value={formData.year_abbreviation}
                    onChange={handleChange}
                />
                </Form.Group>
            </Col>
            </Row>

            {/* Row 2: Opening Date & Closing Date */}
            <Row className="mb-3">
            <Col md={6}>
                <Form.Group>
                <Form.Label>Opening Date</Form.Label>
                <Form.Control
                    type="date"
                    name="opening_date"
                    value={formData.opening_date}
                    onChange={handleChange}
                />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                <Form.Label>Closing Date</Form.Label>
                <Form.Control
                    type="date"
                    name="closing_date"
                    value={formData.closing_date}
                    onChange={handleChange}
                />
                </Form.Group>
            </Col>
            </Row>

            {/* Row 3: Status */}
            <Row className="mb-3">
            <Col md={6}>
                <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                </Form.Select>
                </Form.Group>
            </Col>
            </Row>

            <Button type="submit" className="mb-4">
            {editData ? 'Update' : 'Submit'}
            </Button>
        </Form>
        </Col>
    </Row>
    </MainCard>

  );
};
export default AddYear;
