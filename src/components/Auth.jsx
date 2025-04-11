import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [authMode, setAuthMode] = useState('signIn')
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)

    if (authMode === 'signUp') {
      // Kontrollera att ett användarnamn är angivet
      if (!username.trim()) {
        setError("Ange ett användarnamn")
        return
      }
      // Kontrollera om användarnamnet redan används
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
      if (checkError) {
        setError(checkError.message)
        return
      }
      if (existingUsers && existingUsers.length > 0) {
        setError("Användarnamnet är redan upptaget")
        return
      }
      
      // Registrera användaren
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const user = data.user
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, username }])
          if (profileError) {
            setError(profileError.message)
          } else {
            alert('Kontrollera din e-post för bekräftelse!')
          }
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-fuchsia-700">Andreas Chattapp</h1>
      <form onSubmit={handleAuth} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">{authMode === 'signUp' ? 'Registrera dig' : 'Logga in'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="E-post"
          className="border p-2 rounded w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Lösenord"
          className="border p-2 rounded w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {authMode === 'signUp' && (
          <input
            type="text"
            placeholder="Användarnamn"
            className="border p-2 rounded w-full mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <button
          type="submit"
          className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-300 text-white px-4 py-2 rounded w-full"
        >
          {authMode === 'signUp' ? 'Registrera dig' : 'Logga in'}
        </button>
        <p className="mt-3 text-center">
          {authMode === 'signUp'
            ? 'Har du redan ett konto?'
            : 'Har du inget konto?'}
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'signUp' ? 'signIn' : 'signUp')}
            className="cursor-pointer ml-2 text-fuchsia-700 underline"
          >
            {authMode === 'signUp' ? 'Logga in' : 'Registrera dig'}
          </button>
        </p>
      </form>
    </div>
  )
}

export default Auth
