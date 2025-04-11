import React, { useState, useEffect } from 'react'
import Auth from './components/Auth'
import { supabase } from './supabaseClient'
import Sidebar from './components/Sidebar'
import ChatRoom from './components/ChatRoom'
import RightSidebar from './components/RightSidebar'

const App = () => {
  const [session, setSession] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Uppdatera last_active var 10:e sekund
  useEffect(() => {
    if (!session) return
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', session.user.id)
    }, 10000)
    return () => clearInterval(interval)
  }, [session])

  if (!session) return <Auth />

  return (
    <div className="h-screen flex">
      <Sidebar
        user={session.user}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
      />
      {selectedRoom ? (
        <ChatRoom room={selectedRoom} user={session.user} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Välj ett rum för att börja chatta</p>
        </div>
      )}
      <RightSidebar currentUserId={session.user.id} />
    </div>
  )
}

export default App
