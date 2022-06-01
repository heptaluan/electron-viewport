import React, { useState } from 'react'
import 'antd/dist/antd.css'
import './assets/scss/reset.scss'
import './assets/scss/common.scss'
import Viewer from './pages/Viewer/Viewer'
import StudyList from './pages/StudyList/StudyList'

const App = () => {
  const [showViewer, setShowViewer] = useState(false)
  const [data, setData] = useState(null)

  return (
    <div className="App">
      <main>
        {showViewer ? null : <StudyList setShowViewer={setShowViewer} setData={setData} />}
        {showViewer ? <Viewer data={data} setShowViewer={setShowViewer} /> : null}
      </main>
    </div>
  )
}

export default App
