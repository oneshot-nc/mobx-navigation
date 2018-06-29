// @flow

import * as React from 'react'
import { BackHandler } from 'react-native'
import { addNavigationHelpers, NavigationActions } from 'react-navigation'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react/native'

export class MobxNavigationStore {
  @observable.ref navigationState: any
  appNavigator: any

  constructor(appNavigator: any, routeName: string) {
    this.appNavigator = appNavigator
    this.dispatch(appNavigator.router.getActionForPathAndParams(routeName))
  }

  @action
  dispatch = (action: any, stackNavState: boolean = true) => {
    const previousNavState = stackNavState ? this.navigationState : null
    this.navigationState = this.appNavigator.router.getStateForAction(action, previousNavState)
  }
}

type MobxNavigationProps = {
  store: MobxNavigationStore,
  listener?: (type: any, fn: any) => void,
  children: (navigation: any) => React.Node
}

@observer
export class MobxNavigation extends React.Component<MobxNavigationProps> {
  static defaultProps = {
    listener: () => {}
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  onBackPress = (): boolean => {
    const { store } = this.props

    if (this.getCurrentRouteIndex(store.navigationState) === 0) {
      return false
    }

    store.dispatch(NavigationActions.back())
    return true
  }

  getCurrentRouteIndex(navigationState) {
    if (!navigationState) {
      return 0;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return this.getCurrentRouteIndex(route);
    }
    return route.index || 0;
  }

  render() {
    const { children, store, listener } = this.props

    return children({
      dispatch: store.dispatch,
      state: store.navigationState,
      addListener: listener
    })
  }
}
