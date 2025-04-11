import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const RightSidebar = ({ currentUserId }) => {
    const [profiles, setProfiles] = useState([])

    const fetchProfiles = async () => {
        const { data, error } = await supabase.from('profiles').select('*')
        if (!error) setProfiles(data)
        else console.error('Fel vid hämtning av användare:', error)
    }

    useEffect(() => { fetchProfiles() }, [])
    useEffect(() => {
        const interval = setInterval(() => { fetchProfiles() }, 10000)
        return () => clearInterval(interval)
    }, [])

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    let onlineUsers = profiles.filter((p) => p.last_active && new Date(p.last_active) > oneMinuteAgo)
    let offlineUsers = profiles.filter((p) => !p.last_active || new Date(p.last_active) <= oneMinuteAgo)

    onlineUsers = onlineUsers.sort((a, b) => (a.username || '').toLowerCase().localeCompare((b.username || '').toLowerCase()))
    offlineUsers = offlineUsers.sort((a, b) => (a.username || '').toLowerCase().localeCompare((b.username || '').toLowerCase()))

    return (
        <div className="w-64 bg-gray-200 text-gray-800 flex flex-col border-l border-gray-300">
            <h2 className="p-4 text-xl border-b border-gray-300">Användare</h2>
            <div className="flex-1 overflow-y-auto p-2">
                <h3 className="font-bold mb-2">Inloggade</h3>
                {onlineUsers.length > 0 ? (
                    <ul className="mb-4">
                        {onlineUsers.map((user) => (
                            <li key={user.id} className="cursor-pointer px-2 py-1 mb-1 bg-fuchsia-50 rounded">
                                {user.username || '(inget användarnamn)'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mb-4">Ingen är online</p>
                )}

                <h3 className="font-bold mb-2">Offline</h3>
                {offlineUsers.length > 0 ? (
                    <ul>
                        {offlineUsers.map((user) => (
                            <li key={user.id} className="cursor-pointer px-2 py-1 mb-1 hover:bg-gray-300 rounded">
                                {user.username || '(inget användarnamn)'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Inga offline‑användare</p>
                )}
            </div>
        </div>
    )
}

export default RightSidebar
