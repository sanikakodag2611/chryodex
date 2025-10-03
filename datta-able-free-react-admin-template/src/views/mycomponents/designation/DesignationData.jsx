import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';

// Hardcoded URL to match DepartmentData.js and avoid process.env issues
const API_URL = 'http://127.0.0.1:8000';

const DesignationData = () => {
  const [designations, setDesignations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default rows per page
  const navigate = useNavigate();

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/designation`);
      setDesignations(response.data);
    } catch (error) {
      console.error('Failed to fetch designations', error);
    }
  };

  const handleEdit = (data) => {
    navigate('/adddesignation', { state: { editData: data } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await axios.delete(`${API_URL}/api/designation/${id}`);
        fetchDesignations(); // refresh
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = designations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(designations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Designations List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/adddesignation")}
          >
            Add
          </Button>
        </div>
      }
    >
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>SR.NO</th>
            <th>Designation Name</th>
            <th>Abbreviation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((designation, index) => (
            <tr key={index}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{designation.designation_name}</td>
              <td>{designation.designation_abbreviation}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEdit(designation)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(designation.id)}
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
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </MainCard>
  );
};

export default DesignationData;
