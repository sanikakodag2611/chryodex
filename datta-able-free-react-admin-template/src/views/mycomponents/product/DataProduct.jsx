import React, { useEffect, useState } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';

const DataProduct = () => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products');
      console.log('Products API response:', response.data); // Log for debugging
      // Handle nested or direct array response
      const productData = response.data.data || response.data;
      // Ensure productData is an array
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Error fetching products:', error.response || error);
      setError('Failed to load products. Please try again.');
      setProducts([]); // Ensure products is an array on error
    }
  };

  useEffect(() => {
    // Fetch products
    fetchProducts();

    // Fetch companies for name mapping
    axios.get('http://127.0.0.1:8000/api/company')
      .then(response => {
        console.log('Companies API response:', response.data); // Log for debugging
        const companyData = response.data.data || response.data;
        setCompanies(Array.isArray(companyData) ? companyData : []);
      })
      .catch(error => {
        console.error('Error fetching companies:', error.response || error);
        setError('Failed to load companies. Please try again.');
      });
  }, []);

  const getCompanyName = (id) => {
    const company = companies.find(c => c.id === id);
    return company ? company.company_name : 'N/A';
  };

  const handleEdit = (product) => {
    navigate('/addproduct', { state: { editData: product } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
        fetchProducts();
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error.response || error);
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <MainCard
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Product List</span>
          <Button
            variant="primary"
            onClick={() => navigate("/addproduct")}
          >
            Add
          </Button>
        </div>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <div style={{ overflowX: 'auto' }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Product Name</th>
              <th>Code</th>
              <th>HSN Code</th>
              <th>Price</th>
              <th>Tax Rate (%)</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.product_name}</td>
                  <td>{product.code}</td>
                  <td>{product.hsn_code}</td>
                  <td>{product.price}</td>
                  <td>{product.tax_rate}</td>
                  <td>{getCompanyName(product.company_id)}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No products available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </MainCard>
  );
};

export default DataProduct;