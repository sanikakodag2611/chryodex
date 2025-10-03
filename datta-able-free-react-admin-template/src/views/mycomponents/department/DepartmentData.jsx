import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';

const DepartmentData = () => {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // rows per page
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const handleEdit = (data) => {
    navigate('/adddepartment', { state: { editData: data } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/departments/${id}`);
        fetchDepartments(); // refresh
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = departments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(departments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Department List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/adddepartment")}
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
            <th>Department Name</th>
            <th>Abbreviation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((dept, index) => (
            <tr key={index}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{dept.department_name}</td>
              <td>{dept.department_abbreviation}</td>
              <td>{dept.status === 1 ? 'Active' : 'Inactive'}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleEdit(dept)} className="me-2">
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(dept.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <Pagination>
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
    </MainCard>
  );
};

export default DepartmentData;
