import React from 'react'
import { renderRoutes } from 'react-router-config'
import { HashRouter } from 'react-router-dom'
import routes from './config'

const Router = () => {
  return (
    <>
      <HashRouter>{renderRoutes(routes)}</HashRouter>
    </>
  )
}

export default Router
