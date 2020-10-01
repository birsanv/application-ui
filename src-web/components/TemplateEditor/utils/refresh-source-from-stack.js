/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 *******************************************************************************/
'use strict'

import { diff } from 'deep-diff'
import jsYaml from 'js-yaml'
import { discoverControls, setEditingMode, reverseTemplate } from './utils'
import { generateSourceFromTemplate } from './refresh-source-from-templates'
import YamlParser from '../components/YamlParser'
import _ from 'lodash'

export const generateSourceFromStack = (
  template,
  editStack,
  controlData,
  otherYAMLTabs
) => {
  if (!editStack.initialized) {
    intializeControls(editStack, controlData)
  }
  return generateSource(editStack, controlData, template, otherYAMLTabs)
}

const intializeControls = (editStack, controlData) => {
  const { customResources, editor, locale } = editStack
  const { templateObject } = generateSourceFromResources(customResources)

  // determine the controls for this resource
  discoverControls(controlData, templateObject, editor, locale)

  // refresh the values from the template for these controls
  reverseTemplate(controlData, templateObject)

  // put controls into editing mode (ex: disable name input)
  setEditingMode(controlData)

  // keep track of template changes
  editStack.templateResourceStack = []
  editStack.initialized = true
}

const generateSource = (editStack, controlData, template, otherYAMLTabs) => {
  const { customResources: resources, templateResourceStack } = editStack

  // get the next iteration of template changes
  const { templateResources: iteration } = generateSourceFromTemplate(template, controlData, otherYAMLTabs)
  templateResourceStack.push(iteration)

  let customResources = _.cloneDeep(resources)
  templateResourceStack.forEach((templateResources, stackInx)=>{
    templateResources = _.cloneDeep(templateResources)
    const nextTemplateResources = _.cloneDeep(templateResourceStack[stackInx+1])
    customResources = customResources.filter(resource=>{

      // filter out custom resource that isn't in next version of template
      const kind = _.get(resource, 'kind', 'unknown')
      const resourceInx = templateResources.findIndex(res=>{
        return kind === _.get(res, 'kind')
      })
      if (resourceInx===-1) {
        return false
      }

      if (nextTemplateResources) {

        // filter out custom resource that not in next version of template
        const nextInx = nextTemplateResources.findIndex(res=>{
          return kind === _.get(res, 'kind')
        })
        if (nextInx===-1) {
          return false
        }

        // compare the difference, and add them to edit the custom resource
        let val, idx
        const oldResource = templateResources.splice(resourceInx,1)[0]
        const newResource = nextTemplateResources.splice(nextInx,1)[0]
        const diffs = diff(oldResource, newResource)
        if (diffs) {
          diffs.forEach(({ kind, path, rhs, item }) => {
            switch (kind) {
            // array modification
            case 'A': {
              switch (item.kind) {
              case 'N':
                val = _.get(resource, path, [])
                val.push(item.rhs)
                _.set(resource, path, val)
                break
              case 'D':
                val = _.get(resource, path, [])
                idx = val.indexOf(item.lhs)
                if (idx!==-1) {
                  val.splice(idx,1)
                }
                break
              }
              break
            }
            case 'E': {
              idx = path.pop()
              val = _.get(resource, path)
              if (Array.isArray(val)) {
                val.splice(idx,1,rhs)
              } else {
                path.push(idx)
                _.set(resource, path, rhs)
              }
              break
            }
            case 'N': {
              _.set(resource, path, rhs)
              break
            }
            case 'D': {
              _.unset(resource, path)
              break
            }
            }
          })
        }
      }
      return true
    })
    if (nextTemplateResources && nextTemplateResources.length) {
      customResources.push(...nextTemplateResources)
    }
  })

  // make sure there's no duplicates
  customResources = _.uniqWith(customResources, _.isEqual)

  // then generate the source from those resources
  return generateSourceFromResources(customResources)
}

const generateSourceFromResources = resources => {
  // use this to sort the keys generated by safeDump
  const order = ['name', 'namespace', 'start', 'end']
  const sortKeys = (a, b) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    if (ai<0 && bi>=0) {
      return 1
    } else if (ai>=0 && bi<0) {
      return -1
    } else if (ai<0 && bi<0) {
      return a.localeCompare(b)
    } else {
      return ai<bi
    }
  }

  let yaml,
      row = 0
  const parsed = {}
  const yamls = []
  resources.forEach(resource => {
    if (!_.isEmpty(resource)) {
      const key = _.get(resource, 'kind', 'unknown')
      yaml = jsYaml.safeDump(resource, { sortKeys, lineWidth: 200})
      yaml = yaml.replaceAll(/'\d+':(\s|$)\s*/gm, '- ')
      yaml = yaml.replaceAll(/:\s*null$/gm, ':')
      const $synced = new YamlParser().parse(yaml, row)
      $synced.$r = row
      $synced.$l = yaml.split(/[\r\n]+/g).length
      let values = parsed[key]
      if (!values) {
        values = parsed[key] = []
      }
      values.push({ $raw: resource, $yml: yaml, $synced })
      row += yaml.split('\n').length
      yamls.push(yaml)
    }
  })

  return {
    templateYAML: yamls.join('---\n'),
    templateObject: parsed
  }
}
