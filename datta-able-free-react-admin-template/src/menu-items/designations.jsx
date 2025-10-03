// menu-items/designations.js

const designations = {
  id: 'designation-management',
  title: 'Designation Management',
  type: 'group',
  children: [
    {
      id: 'designation-collapse',
      title: 'Designations',
      type: 'collapse',
      icon: <i className="ph ph-identification-card" />, // optional icon
      children: [
        {
          id: 'add-designation',
          title: 'Add Designation',
          type: 'item',
          url: '/adddesignation'
        },
        {
          id: 'view-designation',
          title: 'View Designation Data',
          type: 'item',
          url: '/datadesignation'
        }
      ]
    }
  ]
};

export default designations;
