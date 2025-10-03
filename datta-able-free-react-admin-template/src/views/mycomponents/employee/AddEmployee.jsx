import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate, useLocation } from 'react-router-dom';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    employee_name: '',
    email: '',
    username: '',
    password: '',
    contact_no: '',
    address: '',
    date_of_birth: '',
    gender: '',
    state_id: '',
    district_id: '',
    city: '',
    pan_card: '',
    designation_id: '',
    department_id: '',
    company_id: '',
    year_id: '',
    status: 1
  });
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [years, setYears] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  useEffect(() => {
    // Fetch dropdown data
    const fetchData = async () => {
      try {
        const [designationRes, departmentRes, stateRes, districtRes, companyRes, yearRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/designation'),
          axios.get('http://127.0.0.1:8000/api/departments'),
          axios.get('http://127.0.0.1:8000/api/states'),
          axios.get('http://127.0.0.1:8000/api/district'),
          axios.get('http://127.0.0.1:8000/api/company'),
          axios.get('http://127.0.0.1:8000/api/years')
        ]);

        setDesignations(Array.isArray(designationRes.data.data || designationRes.data) ? (designationRes.data.data || designationRes.data) : []);
        setDepartments(Array.isArray(departmentRes.data.data || departmentRes.data) ? (departmentRes.data.data || departmentRes.data) : []);
        setStates(Array.isArray(stateRes.data.data || stateRes.data) ? (stateRes.data.data || stateRes.data) : []);
        setDistricts(Array.isArray(districtRes.data.data || districtRes.data) ? (districtRes.data.data || districtRes.data) : []);
        setCompanies(Array.isArray(companyRes.data.data || companyRes.data) ? (companyRes.data.data || companyRes.data) : []);
        setYears(Array.isArray(yearRes.data.data || yearRes.data) ? (yearRes.data.data || yearRes.data) : []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error.response || error);
        setError('Failed to load dropdown data. Please try again.');
      }
    };

    fetchData();

    // Pre-fill form if editing
    if (editData) {
      setFormData({
        employee_name: editData.employee_name,
        email: editData.email,
        username: editData.username,
        password: '', // Do not pre-fill password for security
        contact_no: editData.contact_no,
        address: editData.address,
        date_of_birth: editData.date_of_birth ? editData.date_of_birth.split('T')[0] : '',
        gender: editData.gender.toString(),
        state_id: editData.state_id.toString(),
        district_id: editData.district_id.toString(),
        city: editData.city,
        pan_card: editData.pan_card,
        designation_id: editData.designation_id.toString(),
        department_id: editData.department_id.toString(),
        company_id: editData.company_id.toString(),
        year_id: editData.year_id.toString(),
        status: editData.status
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
      const submitData = {
        ...formData,
        state_id: formData.state_id ? parseInt(formData.state_id) : '',
        district_id: formData.district_id ? parseInt(formData.district_id) : '',
        designation_id: formData.designation_id ? parseInt(formData.designation_id) : '',
        department_id: formData.department_id ? parseInt(formData.department_id) : '',
        company_id: formData.company_id ? parseInt(formData.company_id) : '',
        year_id: formData.year_id ? parseInt(formData.year_id) : '',
        gender: formData.gender ? parseInt(formData.gender) : ''
      };

      // Omit password for edit requests if empty
      if (editData && !submitData.password) {
        delete submitData.password;
      }

      console.log('Submitting data:', submitData);

      const url = editData
        ? `http://127.0.0.1:8000/api/employee/${editData.id}`
        : 'http://127.0.0.1:8000/api/employee';
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
      setSuccess(editData ? 'Employee updated successfully!' : 'Employee added successfully!');
      setTimeout(() => navigate('/dataemployee'), 1500);
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
          <span>{editData ? 'Edit Employee' : 'Add Employee'}</span>
          <Button
            variant="primary"
            onClick={() => navigate("/dataemployee")}
            disabled={isLoading}
          >
            Employees
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
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                name="employee_name"
                value={formData.employee_name}
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
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editData}
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
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Female"
                  name="gender"
                  value="1"
                  checked={formData.gender === '1'}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Male"
                  name="gender"
                  value="2"
                  checked={formData.gender === '2'}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Others"
                  name="gender"
                  value="3"
                  checked={formData.gender === '3'}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
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
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>District</Form.Label>
              <Form.Select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
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
              <Form.Label>PAN Card</Form.Label>
              <Form.Control
                type="text"
                name="pan_card"
                value={formData.pan_card}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Select
                name="designation_id"
                value={formData.designation_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Designation</option>
                {designations.map(designation => (
                  <option key={designation.id} value={designation.id}>
                    {designation.designation_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.department_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Select
                name="year_id"
                value={formData.year_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year.id} value={year.id}>
                    {year.year_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (editData ? 'Update Employee' : 'Add Employee')}
        </Button>
      </Form>
    </MainCard>
  );
};

export default AddEmployee;