// menu-items/yearitems.js

const yearitems = {
  id: 'year-management',
  title: 'Year Management',
  type: 'group',
  children: [
    {
      id: 'year-collapse',
      title: 'Manage Years',
      type: 'collapse',
      icon: <i className="ph ph-calendar-blank" />, // optional icon
      children: [
        {
          id: 'add-year',
          title: 'Add Year',
          type: 'item',
          url: '/addyear'
        },
        {
          id: 'view-year',
          title: 'View Year Data',
          type: 'item',
          url: '/datayear'
        }
      ]
    }
  ]
};

export default yearitems;
