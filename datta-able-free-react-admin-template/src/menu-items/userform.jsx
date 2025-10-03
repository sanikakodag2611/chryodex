// ==============================|| MENU ITEMS - USER FORM ||============================== //

const userFormMenu = {
  id: 'user-forms',
  title: 'User Forms',
  type: 'group',
  children: [
    {
      id: 'user-form',
      title: 'User Form',
      type: 'item',
      url: '/myform',
      icon: <i className="ph ph-textbox" />,
      breadcrumbs: false
    }
  ]
};

export default userFormMenu;
