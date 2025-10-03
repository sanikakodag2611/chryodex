// menu-items/departments.js

const departments = {
  id: 'department-management',
  title: 'Department Management',
  type: 'group',
  children: [
    {
      id: 'department-collapse',
      title: 'Manage Departments',
      type: 'collapse',
      icon: <i className="ph ph-buildings" />, // optional icon
      children: [
        {
          id: 'add-department',
          title: 'Add Department',
          type: 'item',
          url: '/adddepartment'
        },
        {
          id: 'view-department',
          title: 'View Department Data',
          type: 'item',
          url: '/datadepartment'
        }
      ]
    }
  ]
};

export default departments;
