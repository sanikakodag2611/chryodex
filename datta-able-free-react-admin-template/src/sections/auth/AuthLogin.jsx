import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Stack, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { useForm } from 'react-hook-form';

export default function AuthLoginForm({ className }) {
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [years, setYears] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyResponse, yearResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/company'),
          axios.get('http://localhost:8000/api/years'),
        ]);
        setCompanies(companyResponse.data);
        setYears(yearResponse.data);
      } catch (err) {
        setError('Failed to load companies or years. Please try again.');
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchData();
  }, []);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8000/api/login', {
        username: data.username,
        password: data.password,
        company_id: parseInt(data.company_id),
        year_id: parseInt(data.year_id),
      });

      if (response.data.status) {
        // Store token, employee, company_id, year_id, and designation_id in sessionStorage
        sessionStorage.setItem('auth_token', response.data.token);
        sessionStorage.setItem('employee', JSON.stringify(response.data.employee));
        sessionStorage.setItem('company_id', response.data.company_id);
        sessionStorage.setItem('year_id', response.data.year_id);
        sessionStorage.setItem('designation_id', String(response.data.employee.designation_id));
        sessionStorage.setItem('employee_name', String(response.data.employee.employee_name)); // Corrected to use employee.designation_id

        console.log('Login success:', response.data);
        reset();
        navigate('/datacompany');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.username?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        error.response?.data?.errors?.company_id?.[0] ||
        error.response?.data?.errors?.year_id?.[0] ||
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      console.error('Login error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard className="mb-0">
      <div className="text-center">
        <h4 className={`text-center f-w-500 mt-4 mb-3 ${className}`}>CHRYODEX</h4>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h4 className={`text-center f-w-500 mt-4 mb-3 ${className}`}>Login</h4>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {/* Company Dropdown */}
        <Form.Group className="mb-3" controlId="formCompany">
          <Form.Label>Company</Form.Label>
          <Form.Select
            {...register('company_id', { required: 'Company is required' })}
            isInvalid={!!errors.company_id}
            className={className && 'bg-transparent border-white text-white border-opacity-25'}
            onChange={() => setError('')}
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.company_id?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Year Dropdown */}
        <Form.Group className="mb-3" controlId="formYear">
          <Form.Label>Year</Form.Label>
          <Form.Select
            {...register('year_id', { required: 'Year is required' })}
            isInvalid={!!errors.year_id}
            className={className && 'bg-transparent border-white text-white border-opacity-25'}
            onChange={() => setError('')}
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year_name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.year_id?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Username */}
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>User Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="User Name"
            {...register('username', { required: 'Username is required' })}
            isInvalid={!!errors.username}
            className={className && 'bg-transparent border-white text-white border-opacity-25'}
            onChange={() => setError('')}
          />
          <Form.Control.Feedback type="invalid">
            {errors.username?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Password */}
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              isInvalid={!!errors.password}
              className={className && 'bg-transparent border-white text-white border-opacity-25'}
              onChange={() => setError('')}
            />
            <Button onClick={togglePasswordVisibility} type="button">
              {showPassword ? (
                <i className="ti ti-eye" />
              ) : (
                <i className="ti ti-eye-off" />
              )}
            </Button>
          </InputGroup>
          <Form.Control.Feedback type="invalid">
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Remember & Forgot */}
        <Stack direction="horizontal" className="mt-1 justify-content-between align-items-center">
          <Form.Group controlId="customCheckc1">
            <Form.Check
              type="checkbox"
              label="Remember me?"
              defaultChecked
              className={`input-primary ${className ? className : 'text-muted'}`}
            />
          </Form.Group>
          <a href="#!" className={`text-secondary f-w-400 mb-0 ${className}`}>
            Forgot Password?
          </a>
        </Stack>

        <div className="text-center mt-4">
          <Button
            type="submit"
            className="shadow px-sm-4"
            disabled={companies.length === 0 || years.length === 0 || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </Form>
    </MainCard>
  );
}

AuthLoginForm.propTypes = {
  className: PropTypes.string,
};