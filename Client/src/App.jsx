import { useState } from 'react'
import AuthPage from './AuthPage'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuthPage/>
      </div>
    </>
  )
}

export default App
