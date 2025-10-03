// menu-items.js

const countrystates = {
  id: 'countrystate-management',
  title: 'Country & State Management',
  type: 'group',
  children: [
    {
      id: 'country-state-collapse',
      title: 'Country/State/District',
      type: 'collapse',
      icon: <i className="ph ph-map-pin" />, // You can change the icon
      children: [
        {
          id: 'add-country',
          title: 'Add Country',
          type: 'item',
          url: '/addcountry'
        },
        {
          id: 'view-country',
          title: 'View Country Data',
          type: 'item',
          url: '/datacountry'
        },
        {
          id: 'add-state',
          title: 'Add State',
          type: 'item',
          url: '/addstate'
        },
        {
          id: 'view-state',
          title: 'View State Data',
          type: 'item',
          url: '/datastate'
        },
        {
          id: 'add-district',
          title: 'Add District',
          type: 'item',
          url: '/adddistrict'
        },
        {
          id: 'view-district',
          title: 'View District Data',
          type: 'item',
          url: '/datadistrict'
        }
      ]
    }
  ]
};

export default countrystates;
