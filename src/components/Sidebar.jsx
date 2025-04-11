import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Sidebar = ({ user, selectedRoom, setSelectedRoom }) => {
    const [rooms, setRooms] = useState([])
    const [newRoomName, setNewRoomName] = useState('')
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        const fetchRooms = async () => {
            const { data, error } = await supabase.from('rooms').select('*')
            if (!error) setRooms(data)
            else console.error('Fel vid hämtning av rum:', error)
        }
        fetchRooms()
    }, [])

    useEffect(() => {
        const roomChannel = supabase
            .channel('public:rooms')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (payload) => {
                setRooms((prevRooms) => [...prevRooms, payload.new])
            })
            .subscribe()
        return () => { supabase.removeChannel(roomChannel) }
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            if (!error) setProfile(data)
            else console.error('Fel vid hämtning av profil:', error)
        }
        fetchProfile()
    }, [user])

    const isAdmin = profile?.role === 'admin'

    const createRoom = async () => {
        if (!newRoomName) return
        const { data, error } = await supabase
            .from('rooms')
            .insert([{ name: newRoomName, created_by: user.id }])
            .single()
        if (!error) {
            setRooms([...rooms, data])
            setNewRoomName('')
        } else {
            console.error('Fel vid skapande av rum:', error)
        }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Fel vid utloggning:', error)
    }

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <div className="flex flex-col">
                    <p className="text-xs">{user.email}</p>
                    <button
                        onClick={signOut}
                        className="cursor-pointer text-xs bg-fuchsia-700 hover:bg-fuchsia-300 px-2 py-1 rounded mt-2"
                    >
                        Logga ut
                    </button>
                </div>
            </div>
            <h2 className="p-4 text-xl border-b border-gray-700">Chattrum</h2>
            <ul className="flex-1 overflow-y-auto">
                {rooms.filter((room) => room !== null).map((room) => (
                    <li key={room.id}>
                        <button
                            onClick={() => setSelectedRoom(room)}
                            className={`cursor-pointer w-full text-left p-3 hover:bg-gray-700 ${selectedRoom?.id === room.id ? 'bg-gray-700' : ''
                                }`}
                        >
                            {room.name}
                        </button>
                    </li>
                ))}
            </ul>
            {isAdmin && (
                <div className="p-4 border-t border-gray-700">
                    <input
                        type="text"
                        placeholder="Nytt rumnamn"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        className="w-full p-2 rounded text-white bg-gray-700"
                    />
                    <button
                        onClick={createRoom}
                        className="cursor-pointer mt-2 bg-fuchsia-700 hover:bg-fuchsia-300 w-full py-2 rounded"
                    >
                        Skapa Rum
                    </button>
                </div>
            )}
        </div>
    )
}

export default Sidebar
