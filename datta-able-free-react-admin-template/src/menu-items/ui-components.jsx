// ==============================|| MENU ITEMS - UI-COMPONENTS ||============================== //

const uiComponents = {
  id: 'group-ui-components',
  title: 'Report Management',
  type: 'group',
  children: [
    {
      id: 'basic',
      title: 'Report',
      icon: <i className="ph ph-pencil-ruler" />,
      type: 'collapse',
      children: [
        {
          id: 'buttons',
          title: 'Date Wise',
          type: 'item',
          url: '/basic/buttons'
        },
        {
          id: 'badges',
          title: 'Badges',
          type: 'item',
          url: '/basic/badges'
        },
        {
          id: 'breadcrumb',
          title: 'Breadcrumb',
          type: 'item',
          url: '/basic/breadcrumb'
        },
        {
          id: 'collapse',
          title: 'Collapse',
          type: 'item',
          url: '/basic/collapse'
        },
        {
          id: 'tabs-pills',
          title: 'Tabs-pills',
          type: 'item',
          url: '/basic/tabs-pills'
        },
        {
          id: 'typography',
          title: 'Typography',
          type: 'item',
          url: '/basic/typography'
        }
      ]
    }
  ]
};

export default uiComponents;
