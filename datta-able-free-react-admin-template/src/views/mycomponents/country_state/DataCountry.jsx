import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';

const DataCountry = () => {
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default rows per page
  const navigate = useNavigate();

  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/countries');
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleEdit = (country) => {
    navigate('/addcountry', { state: { editData: country } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      try {
        await axios.delete(`http://localhost:8000/api/countries/${id}`);
        fetchCountries();
      } catch (error) {
        console.error('Error deleting country:', error);
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = countries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(countries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Country List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/addcountry")}
          >
            Add
          </Button>
        </div>
      }
    >
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Country Name</th>
            <th>Abbreviation</th>
            <th>Code</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((country, index) => (
            <tr key={country.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{country.country_name}</td>
              <td>{country.country_abbr}</td>
              <td>{country.country_code}</td>
              <td>{country.status === 1 ? 'Active' : 'Inactive'}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(country)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(country.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center">
        {/* Rows per page selector */}
        {/* <div>
          <span>Rows per page: </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // reset to first page
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div> */}

        {/* Pagination buttons */}
        <Pagination className="mb-0">
          <Pagination.Prev
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={idx + 1 === currentPage}
              onClick={() => paginate(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </MainCard>
  );
};

export default DataCountry;
