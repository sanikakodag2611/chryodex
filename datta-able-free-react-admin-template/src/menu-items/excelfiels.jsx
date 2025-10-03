// menu-items/excelfiels.js

const excelfiels = {
  id: 'File-management',
  title: 'File Management',
  type: 'group',
  children: [
    {
      id: 'File-collapse',
      title: 'Files',
      type: 'collapse',
      icon: <i className="ph ph-identification-card" />, // optional icon
      children: [
        {
          id: 'add-File',
          title: 'Add File',
          type: 'item',
          url: '/addfile'
        },
        {
          id: 'view-barchart',
          title: 'Add Entry',
          type: 'item',
          url: '/databarchart'
        },
        {
          id: 'view-linechart',
          title: 'View Entry Data',
          type: 'item',
          url: '/datalinechart'
        },
        // {
        //   id: 'view-piechart',
        //   title: 'View Pie Data',
        //   type: 'item',
        //   url: '/datapiechart'
        // }
      ]
    }
  ]
};

export default excelfiels;
