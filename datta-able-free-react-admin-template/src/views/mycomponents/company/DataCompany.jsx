import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';


const DataCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/company');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    // Fetch companies
    fetchCompanies();

    // Fetch countries
    axios.get('http://127.0.0.1:8000/api/countries')
      .then(response => setCountries(response.data))
      .catch(error => console.error('Error fetching countries:', error));

    // Fetch states
    axios.get('http://127.0.0.1:8000/api/states')
      .then(response => setStates(response.data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  const getCountryName = (id) => {
    const country = countries.find(c => c.id === id);
    return country ? country.country_name : 'N/A';
  };

  const getStateName = (id) => {
    const state = states.find(s => s.id === id);
    return state ? state.state_name : 'N/A';
  };

  const handleEdit = (company) => {
    navigate('/addcompany', { state: { editData: company } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/company/${id}`);
        fetchCompanies();
        alert('Company deleted successfully');
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Company List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/addcompany")}
          >
            Add
          </Button>
        </div>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Country</th>
              <th>State</th>
              <th>City</th>
              <th>Address</th>
              <th>GSTIN/UIN</th>
              <th>PAN No</th>
              <th>Contact No</th>
              <th>Email</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr key={company.id}>
                <td>{index + 1}</td>
                <td>{company.company_name}</td>
                <td>{company.contact_person}</td>
                <td>{getCountryName(company.country_id)}</td>
                <td>{getStateName(company.state_id)}</td>
                <td>{company.city}</td>
                <td>{company.company_address}</td>
                <td>{company.gstin_uin || 'N/A'}</td>
                <td>{company.pan_no || 'N/A'}</td>
                <td>{company.contact_no}</td>
                <td>{company.email}</td>
                <td>{company.website || 'N/A'}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(company)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </MainCard>
  );
};

export default DataCompany;