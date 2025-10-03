import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';

const DataDistrict = () => {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default rows per page
  const navigate = useNavigate();

  const fetchDistricts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/district');
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  useEffect(() => {
    // Fetch districts
    fetchDistricts();

    // Fetch states
    axios
      .get('http://127.0.0.1:8000/api/states')
      .then((response) => {
        const stateData = response.data.data || response.data;
        setStates(Array.isArray(stateData) ? stateData : []);
      })
      .catch((error) => console.error('Error fetching states:', error));
  }, []);

  const getStateName = (id) => {
    const state = states.find((s) => s.id === id);
    return state ? state.state_name : 'N/A';
  };

  const handleEdit = (district) => {
    navigate('/adddistrict', { state: { editData: district } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this district?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/district/${id}`);
        fetchDistricts();
        alert('District deleted successfully');
      } catch (error) {
        console.error('Error deleting district:', error);
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = districts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(districts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>District List</span>
          <Button variant="primary" onClick={() => navigate('/adddistrict')}>
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
              <th>District Name</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((district, index) => (
              <tr key={district.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{district.district_name}</td>
                <td>{getStateName(district.state_id)}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(district)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(district.id)}
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
              onClick={() =>
                currentPage < totalPages && paginate(currentPage + 1)
              }
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
    </MainCard>
  );
};

export default DataDistrict;
