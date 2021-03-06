/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import I18n from 'i18n!discussions_v2'
import React, { Component } from 'react'
import { func, bool, string, arrayOf } from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Container from '@instructure/ui-core/lib/components/Container'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import Spinner from '@instructure/ui-core/lib/components/Spinner'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Text from '@instructure/ui-core/lib/components/Text'
import masterCourseDataShape from '../../shared/proptypes/masterCourseData'
import DiscussionsContainer, { DroppableDiscussionsContainer } from './DiscussionContainer'

import select from '../../shared/select'
import { selectPaginationState } from '../../shared/reduxPagination'
import { discussionList } from '../../shared/proptypes/discussion'
import propTypes from '../propTypes'
import actions from '../actions'
import DRAG_AND_DROP_ROLES from '../../shared/DragAndDropRoles'

export default class DiscussionsIndex extends Component {
  static propTypes = {
    closeForComments: func.isRequired,
    closedForCommentsDiscussions: discussionList,
    getDiscussions: func.isRequired,
    hasLoadedDiscussions: bool.isRequired,
    isLoadingDiscussions: bool.isRequired,
    masterCourseData: masterCourseDataShape,
    permissions: propTypes.permissions.isRequired,
    pinnedDiscussions: discussionList,
    roles: arrayOf(string).isRequired,
    togglePin: func.isRequired,
    unpinnedDiscussions: discussionList,
  }

  static defaultProps = {
    pinnedDiscussions: [],
    unpinnedDiscussions: [],
    closedForCommentsDiscussions: [],
    masterCourseData: null,
  }

  componentDidMount () {
    if (!this.props.hasLoadedDiscussions) {
      this.props.getDiscussions()
    }
  }

  selectPage (page) {
    return () => this.props.getDiscussions({ page, select: true })
  }

  renderSpinner (condition, title) {
    if (condition) {
      return (
        <div style={{textAlign: 'center'}}>
          <Spinner size="small" title={title} />
          <Text size="small" as="p">{title}</Text>
        </div>
      )
    } else {
      return null
    }
  }

  renderStudentView () {
    return (
      <Container margin="medium">
        <div className="pinned-discussions-v2__wrapper">
          <DiscussionsContainer
            title={I18n.t("Pinned Discussions")}
            discussions={this.props.pinnedDiscussions}
            permissions={this.props.permissions}
            masterCourseData={this.props.masterCourseData}
            roles={this.props.roles}
          />
        </div>
        <div className="closed-for-comments-discussions-v2__wrapper">
          <DiscussionsContainer
            title={I18n.t("Closed for Comments")}
            discussions={this.props.closedForCommentsDiscussions}
            permissions={this.props.permissions}
            masterCourseData={this.props.masterCourseData}
            roles={this.props.roles}
          />
        </div>
      </Container>
    )
  }

  renderTeacherView () {
    return (
      <Container margin="medium">
      <div className="pinned-discussions-v2__wrapper">
        <DroppableDiscussionsContainer
          title={I18n.t("Pinned Discussions")}
          discussions={this.props.pinnedDiscussions}
          permissions={this.props.permissions}
          masterCourseData={this.props.masterCourseData}
          togglePin={this.props.togglePin}
          roles={this.props.roles}
          closedState={false}
          pinned
        />
      </div>
      <div className="unpinned-discussions-v2__wrapper">
        <DroppableDiscussionsContainer
          title={I18n.t("Discussions")}
          discussions={this.props.unpinnedDiscussions}
          permissions={this.props.permissions}
          masterCourseData={this.props.masterCourseData}
          togglePin={this.props.togglePin}
          pinned={false}
          closedState={false}
          roles={this.props.roles}
        />
      </div>
        <div className="closed-for-comments-discussions-v2__wrapper">
          <DroppableDiscussionsContainer
            title={I18n.t("Closed for Comments")}
            discussions={this.props.closedForCommentsDiscussions}
            permissions={this.props.permissions}
            masterCourseData={this.props.masterCourseData}
            closeForComments={this.props.closeForComments}
            roles={this.props.roles}
            pinned={false}
            closedState
          />
        </div>
      </Container>
    )
  }

  render () {
    return (
      <div className="discussions-v2__wrapper">
        <ScreenReaderContent>
          <Heading level="h1">{I18n.t('Announcements')}</Heading>
        </ScreenReaderContent>
        {this.renderSpinner(this.props.isLoadingDiscussions, I18n.t('Loading Discussions'))}
        {this.props.roles.some((role) => DRAG_AND_DROP_ROLES.includes(role)) ? this.renderTeacherView() : this.renderStudentView()}
      </div>
    )
  }
}

const connectState = state => Object.assign({
  // other props here
}, selectPaginationState(state, 'discussions'), select(state,
  ['permissions',
    'roles',
    'masterCourseData',
    'pinnedDiscussions',
    'closedForCommentsDiscussions',
    'unpinnedDiscussions']
))
const connectActions = dispatch => bindActionCreators(select(actions, ['getDiscussions', 'closeForComments', 'togglePin']), dispatch)
export const ConnectedDiscussionsIndex = DragDropContext(HTML5Backend)(connect(connectState, connectActions)(DiscussionsIndex))
