import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AddCountry() {
    const [formData, setFormData] = useState({
        country_name: '',
        country_abbr: '',
        country_code: '',
        status: 1
    });

    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.editData;

    useEffect(() => {
        if (editData) {
            setFormData(editData);
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editData
                ? `http://127.0.0.1:8000/api/countries/${editData.id}`
                : 'http://127.0.0.1:8000/api/countries';

            const method = editData ? 'put' : 'post';

            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            console.log('Success:', response.data);
            navigate('/datacountry'); // redirect to data table page
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
        }
    };

    return (
        <MainCard 
        title={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{editData ? 'Edit Country' : 'Add Country'}</span>
                   <Button
                    variant="primary"
                    onClick={() => navigate("/datacountry")}
                  >
                    Countries
                  </Button>
                </div>
              }
        >
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Country Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="country_name"
                                value={formData.country_name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Country Abbreviation</Form.Label>
                            <Form.Control
                                type="text"
                                name="country_abbr"
                                value={formData.country_abbr}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Country Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="country_code"
                                value={formData.country_code}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
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

                <Button variant="primary" type="submit">
                    {editData ? 'Update Country' : 'Add Country'}
                </Button>
            </Form>
        </MainCard>
    );
}
