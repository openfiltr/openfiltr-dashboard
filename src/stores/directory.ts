import * as clientsApi from '@/api/clients'
import { createCrudStore } from '@/stores/resourceFactory'

export const useClientsStore = createCrudStore('clients', {
  list: clientsApi.listClients,
  create: clientsApi.createClient,
  update: clientsApi.updateClient,
  remove: clientsApi.deleteClient,
})

export const useGroupsStore = createCrudStore('groups', {
  list: clientsApi.listGroups,
  create: clientsApi.createGroup,
  update: clientsApi.updateGroup,
  remove: clientsApi.deleteGroup,
})
