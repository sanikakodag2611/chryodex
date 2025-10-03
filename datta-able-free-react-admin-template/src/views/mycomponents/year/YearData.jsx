import { useEffect, useState } from 'react';
import { Button, Table, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'components/MainCard';
import api from "../../../baseurl";

const YearData = () => {
  const [years, setYears] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // how many rows per page

  const navigate = useNavigate();

  const fetchYears = async () => {
    // const res = await axios.get('http://127.0.0.1:8000/api/years');
    const res = await api.get("/years");
    setYears(res.data);
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleEdit = (year) => {
    navigate('/addyear', { state: { editData: year } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this year?')) {
      await axios.delete(`http://127.0.0.1:8000/api/years/${id}`);
      fetchYears();
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = years.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(years.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Year List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/addyear")}
          >
            Add
          </Button>
        </div>
      }
    >
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Sr.NO</th>
            <th>Year Name</th>
            <th>Abbreviation</th>
            <th>Opening Date</th>
            <th>Closing Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((year, index) => (
            <tr key={index}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{year.year_name}</td>
              <td>{year.year_abbreviation}</td>
              <td>{year.opening_date}</td>
              <td>{year.closing_date}</td>
              <td>{year.status ? 'Active' : 'Inactive'}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(year)}>Edit</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDelete(year.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <Pagination>
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === currentPage}
            onClick={() => paginate(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </MainCard>
  );
};

export default YearData;
