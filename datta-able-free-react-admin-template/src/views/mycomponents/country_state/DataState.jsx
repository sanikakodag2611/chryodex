import React, { useEffect, useState } from "react";
import axios from "axios";
import MainCard from "components/MainCard";
import { Table, Button, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DataState = () => {
  const [states, setStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default rows per page
  const navigate = useNavigate();

  const fetchStates = () => {
    axios
      .get("http://127.0.0.1:8000/api/states")
      .then((res) => {
        // Handle nested data if needed
        const stateData = res.data.data || res.data;
        setStates(Array.isArray(stateData) ? stateData : []);
      })
      .catch((err) => console.error("Error fetching states", err));
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleEdit = (state) => {
    navigate("/addstate", { state: { editData: state } });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      axios
        .delete(`http://127.0.0.1:8000/api/states/${id}`)
        .then(() => fetchStates())
        .catch((err) => console.error("Error deleting state", err));
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = states.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(states.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainCard
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>State List</span>
          <Button variant="primary" onClick={() => navigate("/addstate")}>
            Add
          </Button>
        </div>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Sr.NO</th>
              <th>State Name</th>
              <th>Abbreviation</th>
              <th>State UT</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((state, index) => (
              <tr key={state.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{state.state_name}</td>
                <td>{state.state_abbr}</td>
                <td>{state.state_ut}</td>
                <td>{state.country_name}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(state)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(state.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination controls */}
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

export default DataState;
