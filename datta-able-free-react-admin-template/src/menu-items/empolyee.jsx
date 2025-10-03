// menu-items/employee.js
const empolyee = {
  id: 'employee-management',
  title: 'Empolyee Management',
  type: 'group',
  children: [
    {
      id: 'employee-collapse',
      title: 'Empolyee',
      type: 'collapse',
      icon: <i className="ph ph-identification-card" />, // optional icon
      children: [
        {
          id: 'add-employee',
          title: 'Add Empolyee',
          type: 'item',
          url: '/addemployee'
        },
        {
          id: 'view-employee',
          title: 'View Empolyee Data',
          type: 'item',
          url: '/dataemployee'
        }
      ]
    }
  ]
};

export default empolyee;
