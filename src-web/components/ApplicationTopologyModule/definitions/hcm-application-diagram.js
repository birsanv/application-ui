/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 *******************************************************************************/
'use strict'
import jsYaml from 'js-yaml'
import {
  getStoredObject,
  saveStoredObject
} from '../../../../lib/client/resource-helper'
import {
  getClusterName,
  setupResourceModel,
  computeNodeStatus
} from '../../Topology/utils/diagram-helpers'
import { getTopologyElements } from './hcm-topology'
import { REQUEST_STATUS } from '../../../actions'
import _ from 'lodash'
import R from 'ramda'

// remove the system stuff
const system = [
  'creationTimestamp',
  'selfLink',
  'status',
  'uid',
  'annotations',
  'livenessProbe',
  'resourceVersion'
]
const removeMeta = obj => {
  for (const key in obj) {
    if (system.indexOf(key) !== -1) {
      delete obj[key]
    } else if (typeof obj[key] === 'object') {
      removeMeta(obj[key])
    }
  }
}
const sortKeys = (a, b) => {
  if (a === 'name' && b !== 'name') {
    return -1
  } else if (a !== 'name' && b === 'name') {
    return 1
  } else if (a === 'namespace' && b !== 'namespace') {
    return -1
  } else if (a !== 'namespace' && b === 'namespace') {
    return 1
  }
  return a.localeCompare(b)
}

export const getActiveChannel = localStoreKey => {
  const storedActiveChannel = getStoredObject(localStoreKey)
  if (storedActiveChannel) {
    return storedActiveChannel.activeChannel
  }

  return undefined
}

//link the search objects to this node; set the pods status if the node has pods
export const processNodeData = (node, podMap, isClusterGrouped) => {
  const { name, type } = node

  if (R.contains(type, ['cluster', 'application', 'rules'])) {
    return //ignore these types
  }

  const clusterName = getClusterName(node.id)
  if (type === 'subscription') {
    //don't use cluster name when grouping subscriptions
    podMap[name] = node
  } else if (clusterName.indexOf(', ') > -1) {
    podMap[name] = node
    isClusterGrouped.value = true
  } else {
    podMap[`${name}-${clusterName}`] = node
  }
}

export const getDiagramElements = (
  topology,
  localStoreKey,
  iname,
  inamespace,
  applicationDetails
) => {
  const {
    status,
    loaded,
    reloading,
    willLoadDetails,
    detailsLoaded,
    detailsReloading
  } = topology
  const topologyReloading = reloading
  const topologyLoadError = status === REQUEST_STATUS.ERROR
  if (loaded && !topologyLoadError) {
    // topology from api will have raw k8 objects, pods status
    const { links, nodes } = getTopologyElements(topology)
    // create yaml and what row links to what node
    let row = 0
    const yamls = []
    const clusters = []
    let activeChannel
    let channels = []
    const originalMap = {}
    const podMap = {}
    const isClusterGrouped = {
      value: false
    }
    nodes.forEach(node => {
      const { type } = node

      if (type === 'application') {
        activeChannel = _.get(
          node,
          'specs.activeChannel',
          '__ALL__/__ALL__//__ALL__/__ALL__'
        )
        channels = _.get(node, 'specs.channels', [])
      }

      processNodeData(node, podMap, isClusterGrouped)

      const raw = _.get(node, 'specs.raw')
      if (raw) {
        node.specs.row = row
        originalMap[raw.kind] = raw
        const dumpRaw = _.cloneDeep(raw)
        removeMeta(dumpRaw)
        const yaml = jsYaml.safeDump(dumpRaw, { sortKeys })
        yamls.push(yaml)
        row += yaml.split('\n').length
      }
    })
    const yaml = yamls.join('---\n')

    // save results
    saveStoredObject(localStoreKey, {
      activeChannel,
      channels
    })
    saveStoredObject(`${localStoreKey}-${activeChannel}`, {
      clusters,
      links,
      nodes,
      yaml
    })

    // details are requested separately for faster load
    // if loaded, we add those details now
    addDiagramDetails(
      topology,
      podMap,
      activeChannel,
      localStoreKey,
      isClusterGrouped,
      applicationDetails
    )

    nodes.forEach(node => {
      computeNodeStatus(node)
    })

    return {
      clusters,
      activeChannel,
      channels,
      links,
      nodes,
      pods: topology.pods,
      yaml,
      originalMap,
      topologyLoaded: true,
      storedVersion: false,
      topologyLoadError,
      topologyReloading,
      willLoadDetails,
      detailsLoaded,
      detailsReloading
    }
  }

  // if not loaded yet, see if there's a stored version
  // with the same diagram filters
  if (!topologyReloading) {
    let channels = []
    let activeChannel
    const storedActiveChannel = getStoredObject(localStoreKey)
    if (storedActiveChannel) {
      activeChannel = storedActiveChannel.activeChannel
      channels = storedActiveChannel.channels || []
    }
    activeChannel = _.get(
      topology,
      'fetchFilters.application.channel',
      activeChannel
    )
    if (activeChannel) {
      const storedElements = getStoredObject(
        `${localStoreKey}-${activeChannel}`
      )
      if (storedElements) {
        const {
          clusters = [],
          empty_links = [],
          empty_nodes = [],
          yaml = ''
        } = storedElements
        return {
          clusters,
          activeChannel,
          channels,
          empty_links,
          empty_nodes,
          yaml,
          topologyLoaded: true,
          storedVersion: true,
          topologyLoadError,
          topologyReloading
        }
      }
    }
  }

  // if no topology yet, create diagram with search item
  const links = []
  const nodes = []
  const clusters = []
  const channels = []
  const yaml = ''

  // create application node
  const appId = `application--${iname}`
  nodes.push({
    name: iname,
    namespace: inamespace,
    type: 'application',
    uid: appId,
    specs: { isDesign: true }
  })
  return {
    clusters,
    channels,
    activeChannel: undefined,
    links,
    nodes,
    yaml,
    topologyLoaded: false,
    topologyLoadError,
    topologyReloading
  }
}

export const addDiagramDetails = (
  topology,
  podMap,
  activeChannel,
  localStoreKey,
  isClusterGrouped,
  applicationDetails
) => {
  const { detailsReloading } = topology
  // get extra details from topology or from localstore
  let related = []
  if (applicationDetails) {
    if (!R.isEmpty(R.pathOr([], ['items'])(applicationDetails))) {
      //get the app related objects
      related = R.pathOr([], ['related'])(applicationDetails.items[0])
    }
    // save in local store
    saveStoredObject(`${localStoreKey}-${activeChannel}-details`, {
      related
    })
  } else if (!detailsReloading) {
    // if not loaded yet, see if there's a stored version
    // with the same diagram filters
    related = getStoredObject(`${localStoreKey}-${activeChannel}-details`)
  }
  //link search objects with topology deployable objects displayed in the tree
  setupResourceModel(related, podMap, isClusterGrouped)
}
