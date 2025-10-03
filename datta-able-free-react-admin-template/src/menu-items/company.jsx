// menu-items/company.js

const company = {
  id: 'company-management',
  title: 'Company Management',
  type: 'group',
  children: [
    {
      id: 'company-collapse',
      title: 'Manage Company',
      type: 'collapse',
      icon: <i className="ph ph-buildings" />, // optional icon
      children: [
        {
          id: 'add-company',
          title: 'Add Company',
          type: 'item',
          url: '/addcompany'
        },
        {
          id: 'view-company',
          title: 'View Company Data',
          type: 'item',
          url: '/datacompany'
        }
      ]
    }
  ]
};

export default company;
