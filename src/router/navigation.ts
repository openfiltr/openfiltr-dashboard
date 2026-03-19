import {
  archiveOutline,
  banOutline,
  checkmarkDoneOutline,
  cloudDownloadOutline,
  desktopOutline,
  gitNetworkOutline,
  keyOutline,
  peopleOutline,
  pulseOutline,
  serverOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
} from 'ionicons/icons'

export const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard overview', icon: speedometerOutline },
    ],
  },
  {
    title: 'Filtering',
    items: [
      { to: '/filtering/block-rules', label: 'Block rules', icon: banOutline },
      { to: '/filtering/allow-rules', label: 'Allow rules', icon: checkmarkDoneOutline },
      { to: '/filtering/sources', label: 'Rule sources', icon: cloudDownloadOutline },
    ],
  },
  {
    title: 'DNS',
    items: [
      { to: '/dns/upstream-servers', label: 'Upstream DNS servers', icon: serverOutline },
      { to: '/dns/entries', label: 'Local DNS entries', icon: gitNetworkOutline },
    ],
  },
  {
    title: 'Access',
    items: [
      { to: '/clients', label: 'Clients', icon: desktopOutline },
      { to: '/groups', label: 'Groups', icon: peopleOutline },
      { to: '/tokens', label: 'API tokens', icon: keyOutline },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { to: '/activity', label: 'Activity log', icon: pulseOutline },
      { to: '/audit', label: 'Audit log', icon: shieldCheckmarkOutline },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/config', label: 'Config import/export', icon: archiveOutline },
    ],
  },
]
