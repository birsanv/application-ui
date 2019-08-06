/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// seems to be an issue with this rule and redux
/* eslint-disable import/no-named-as-default */

import React from 'react'
import loadable from 'loadable-components'
import { Tabs, Tab } from 'carbon-components-react'
import msgs from '../../../nls/platform.properties'
import ApplicationDeploymentHighlights from '../../components/ApplicationDeploymentHighlights'
import resources from '../../../lib/shared/resources'
import { propType } from 'graphql-anywhere'

resources(() => {
  require('./style.scss')
})

export const ApplicationsTab = loadable(() =>
  import(/* webpackChunkName: "applications" */ '../ApplicationsTab')
)

export const ApplicationDeploymentPipeline = loadable(() =>
  import(/* webpackChunkName: "applicationdeploymentpipeline" */ '../../components/ApplicationDeploymentPipeline')
)

export const IncidentsTab = loadable(() =>
  import(/* webpackChunkName: "incidents" */ '../IncidentsTab')
)

class ApplicationHeaderTabs extends React.Component {
  static propTypes = {
    showIncidentsTab: propType.bool
  };

  constructor(props) {
    super(props)
  }

  render() {
    const { locale } = this.context
    const { showIncidentsTab } = this.props
    return (
      <div id="applicationheadertabs">
        <div className="whiteSpacer">
          <Tabs
            className="some-class"
            selected={0}
            onClick={() => {}}
            onKeyDown={() => {}}
            onSelectionChange={() => {}}
            tabContentClassName="tab-content"
          >
            <Tab
              disabled={false}
              onClick={() => {}}
              onKeyDown={() => {}}
              label={msgs.get('description.title.overview', locale)}
            >
              <div className="some-content">
                <ApplicationsTab
                  secondaryHeaderProps={{ title: 'routes.applications' }}
                />
              </div>
            </Tab>
            <Tab
              disabled={false}
              onClick={() => {}}
              onKeyDown={() => {}}
              label={msgs.get('description.title.deployments', locale)}
            >
              <div className="page-content-container">
                <ApplicationDeploymentHighlights />
                <ApplicationDeploymentPipeline />
              </div>
            </Tab>
            {showIncidentsTab && (
              <Tab
                disabled={false}
                onClick={() => {}}
                onKeyDown={() => {}}
                label={msgs.get('description.title.incidents', locale)}
              >
                <div className="some-content">
                  <IncidentsTab />
                </div>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    )
  }
}

export default ApplicationHeaderTabs
