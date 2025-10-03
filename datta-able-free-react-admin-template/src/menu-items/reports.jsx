// menu-items/designations.js

const reports = {
  id: 'report-management',
  title: 'Report Management',
  type: 'group',
  children: [
    {
      id: 'report-collapse',
      title: 'Report',
      type: 'collapse',
      icon: <i className="ph ph-identification-card" />, // optional icon
      children: [
        {
          id: 'datewise',
          title: 'Date Wise',
          type: 'item',
          url: '/datewise'
        },
        {
          id: 'productwise',
          title: 'Product Wise',
          type: 'item',
          url: '/productwise'
        },
        {
          id: 'salesmanwise',
          title: 'Salesman Wise',
          type: 'item',
          url: '/salesmanwise'
        },{
          id: 'citywise',
          title: 'City Wise',
          type: 'item',
          url: '/citywise'
        }
      ]
    }
  ]
};

export default reports;
