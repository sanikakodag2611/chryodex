// menu-items/designations.js

const products = {
  id: 'product-management',
  title: 'Product Management',
  type: 'group',
  children: [
    {
      id: 'product-collapse',
      title: 'Products',
      type: 'collapse',
      icon: <i className="ph ph-identification-card" />, // optional icon
      children: [
        {
          id: 'add-products',
          title: 'Add Products',
          type: 'item',
          url: '/addproduct'
        },
        {
          id: 'view-designation',
          title: 'View Products Data',
          type: 'item',
          url: '/dataproduct'
        }
      ]
    }
  ]
};

export default products;
