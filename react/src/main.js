/* eslint-disable react/display-name, react/no-multi-comp */
// @flow

import { Module } from './moduleLoader'
import React from 'react'

window.moduleLoader.onLoad('store').then(({ store }) => {

  const modules = [
      new Module('ApplicationListWidget', props => <ApplicationListWidget {...props}/>, true),
  ] // yo-insert-above

  modules.forEach(module => window.moduleLoader.load(module))
})
