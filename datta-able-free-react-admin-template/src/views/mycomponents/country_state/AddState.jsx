import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MainCard from "components/MainCard";
import { Form, Button, Row, Col } from "react-bootstrap";

const AddState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.editData || null;

  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    state_name: "",
    state_abbr: "",
    state_ut: "",
    country_id: ""
  });

  // Load country list
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/countries")
      .then((res) => setCountries(res.data))
      .catch((err) => console.error("Error fetching countries", err));
  }, []);

  // Fill form if editing
  useEffect(() => {
    if (editState) {
      setFormData({
        state_name: editState.state_name,
        state_abbr: editState.state_abbr,
        state_ut: editState.state_ut,
        country_id: editState.country_id
      });
    }
  }, [editState]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editState) {
      axios.put(`http://127.0.0.1:8000/api/states/${editState.id}`, formData)
        .then(() => navigate("/datastate"))
        .catch((err) => console.error("Error updating state", err));
    } else {
      axios.post("http://127.0.0.1:8000/api/states", formData)
        .then(() => navigate("/datastate"))
        .catch((err) => console.error("Error adding state", err));
    }
  };

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{editState ? "Edit State" : "Add State"}</span>
           <Button
            variant="primary"
            onClick={() => navigate("/datastate")}
          >
            States
          </Button>
        </div>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State Name</Form.Label>
              <Form.Control
                type="text"
                name="state_name"
                value={formData.state_name}
                onChange={handleChange}
                placeholder="Enter state name"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State Abbreviation</Form.Label>
              <Form.Control
                type="text"
                name="state_abbr"
                value={formData.state_abbr}
                onChange={handleChange}
                placeholder="Enter abbreviation"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State UT</Form.Label>
              <Form.Control
                type="text"
                name="state_ut"
                value={formData.state_ut}
                onChange={handleChange}
                placeholder="Enter state UT"
                required
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
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.country_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          {editState ? "Update" : "Submit"}
        </Button>
      </Form>
    </MainCard>
  );
};

export default AddState;