import { NavItem } from "./nav-item/nav-item";

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Home',
    iconName: 'home',
    route: '/app',
  },
  {
    navCap: 'Notes',
  },
  // {
  //   displayName: 'Note 1',
  //   iconName: 'description',
  //   route: '/ui-components/badge',
  // },
  // {
  //   displayName: 'Note 2',
  //   iconName: 'description',
  //   route: '/ui-components/chips',
  // },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Logout',
    iconName: 'logout',
    route: '/auth/logout',
  },
  // {
  //   navCap: 'Extra',
  // },
  // {
  //   displayName: 'Icons',
  //   iconName: 'mood-smile',
  //   route: '/extra/icons',
  // },
  // {
  //   displayName: 'Sample Page',
  //   iconName: 'aperture',
  //   route: '/extra/sample-page',
  // },
];
