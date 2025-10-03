import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';

const DataEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [dropdowns, setDropdowns] = useState({
    designations: [],
    departments: [],
    states: [],
    districts: [],
    companies: [],
    years: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Fetch employees ---
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/employee');
      const employeeData = res.data.data || res.data;
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err.response || err);
      setError('Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch dropdowns ---
  const fetchDropdowns = async () => {
    try {
      const [des, dep, st, dis, comp, yr] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/designation'),
        axios.get('http://127.0.0.1:8000/api/departments'),
        axios.get('http://127.0.0.1:8000/api/states'),
        axios.get('http://127.0.0.1:8000/api/district'),
        axios.get('http://127.0.0.1:8000/api/company'),
        axios.get('http://127.0.0.1:8000/api/years'),
      ]);

      setDropdowns({
        designations: des.data.data || des.data || [],
        departments: dep.data.data || dep.data || [],
        states: st.data.data || st.data || [],
        districts: dis.data.data || dis.data || [],
        companies: comp.data.data || comp.data || [],
        years: yr.data.data || yr.data || [],
      });
    } catch (err) {
      console.error('Error fetching dropdowns:', err.response || err);
      setError('Failed to load dropdown data. Please refresh.');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdowns();
  }, []);

  // --- Lookup helpers ---
  const getName = (list, id, key) => {
    const item = list.find((x) => x.id === id);
    return item ? item[key] : 'N/A';
  };

  const getGenderName = (val) => {
    switch (val) {
      case 1: return 'Female';
      case 2: return 'Male';
      case 3: return 'Others';
      default: return 'N/A';
    }
  };

  const getStatusName = (val) => (val === 1 ? 'Active' : 'Inactive');

  // --- Actions ---
  const handleEdit = (employee) => {
    navigate('/addemployee', { state: { editData: employee } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/employee/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err.response || err);
      setError('Failed to delete employee. Please try again.');
    }
  };

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Employee List</span>
          <Button variant="primary" onClick={() => navigate("/addemployee")}>
            Add
          </Button>
        </div>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>State</th>
                <th>District</th>
                <th>City</th>
                <th>PAN</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Company</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp, i) => (
                  <tr key={emp.id}>
                    <td>{i + 1}</td>
                    <td>{emp.employee_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.username}</td>
                    <td>{emp.contact_no}</td>
                    <td>{emp.address}</td>
                    <td>{emp.date_of_birth ? emp.date_of_birth.split('T')[0] : 'N/A'}</td>
                    <td>{getGenderName(emp.gender)}</td>
                    <td>{getName(dropdowns.states, emp.state_id, 'state_name')}</td>
                    <td>{getName(dropdowns.districts, emp.district_id, 'district_name')}</td>
                    <td>{emp.city}</td>
                    <td>{emp.pan_card}</td>
                    <td>{getName(dropdowns.designations, emp.designation_id, 'designation_name')}</td>
                    <td>{getName(dropdowns.departments, emp.department_id, 'department_name')}</td>
                    <td>{getName(dropdowns.companies, emp.company_id, 'company_name')}</td>
                    <td>{getName(dropdowns.years, emp.year_id, 'year_name')}</td>
                    <td>{getStatusName(emp.status)}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(emp)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="18" className="text-center">
                    No employees available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </MainCard>
  );
};

export default DataEmployee;
