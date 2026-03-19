import * as dnsApi from '@/api/dns'
import { createCrudStore } from '@/stores/resourceFactory'

export const useUpstreamServersStore = createCrudStore('upstream-servers', {
  list: dnsApi.listUpstreamServers,
  create: dnsApi.createUpstreamServer,
  update: dnsApi.updateUpstreamServer,
  remove: dnsApi.deleteUpstreamServer,
})

export const useDnsEntriesStore = createCrudStore('dns-entries', {
  list: dnsApi.listDnsEntries,
  create: dnsApi.createDnsEntry,
  update: dnsApi.updateDnsEntry,
  remove: dnsApi.deleteDnsEntry,
})
