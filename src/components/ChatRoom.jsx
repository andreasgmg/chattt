import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const ChatRoom = ({ room, user }) => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUsername, setCurrentUsername] = useState('')
    const [senderUsernames, setSenderUsernames] = useState({})
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Hämta inloggad användares username från profiles
    useEffect(() => {
        const fetchOwnProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()
            if (!error && data) setCurrentUsername(data.username)
            else console.error('Fel vid hämtning av egen profil:', error)
        }
        fetchOwnProfile()
    }, [user])

    // Hämta meddelanden med realtime-uppdatering
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('room_id', room.id)
                .order('created_at', { ascending: true })
            if (!error) setMessages(data)
            else console.error('Fel vid hämtning av meddelanden:', error)
        }
        fetchMessages()

        const messageSubscription = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
                (payload) => setMessages((prev) => [...prev, payload.new])
            )
            .subscribe()

        return () => {
            supabase.removeChannel(messageSubscription)
        }
    }, [room.id])

    // Hämta unika usernames för meddelandenas avsändare
    useEffect(() => {
        const fetchSenderUsernames = async () => {
            const senderIds = [...new Set(messages.map((m) => m.user_id))]
            if (senderIds.length === 0) return

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username')
                .in('id', senderIds)
            if (!error && data) {
                const mapping = {}
                data.forEach((profile) => (mapping[profile.id] = profile.username))
                setSenderUsernames(mapping)
            } else console.error('Fel vid hämtning av användarnamn:', error)
        }
        fetchSenderUsernames()
    }, [messages])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage) return

        const { error } = await supabase.from('messages').insert([
            {
                room_id: room.id,
                content: newMessage,
                user_id: user.id,
                display_name: currentUsername,
            },
        ])
        if (error) console.error('Fel vid sändning av meddelande:', error)
        else setNewMessage('')
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-100">
            <div className="p-4 border-b border-gray-300">
                <h2 className="text-2xl">{room.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                    <div key={message.id} className="mb-4">
                        <div className="mb-1 flex items-center">
                            <span className="text-sm text-gray-600">
                                {message.user_id === user.id
                                    ? currentUsername
                                    : senderUsernames[message.user_id] || message.display_name}
                            </span>
                            {message.created_at && (
                                <span className="text-xs text-gray-400 ml-2">
                                    {new Date(message.created_at).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="mb-1">{message.content}</p>
                        <hr className="border-gray-300" />
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-300">
                <input
                    type="text"
                    placeholder="Skriv ditt meddelande..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </form>
        </div>
    )
}

export default ChatRoom
