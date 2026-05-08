import React, { useEffect, useState } from 'react'

const LiveClock = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="live-clock">
      <span>Live Time</span>
      <strong>{now.toLocaleTimeString()}</strong>
      <small>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</small>
    </div>
  )
}

export default LiveClock
