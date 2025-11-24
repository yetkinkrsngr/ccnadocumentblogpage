import { useEffect, useState } from 'react'
import { getRole, getName, parseJwt } from '../auth'

export default function AuthDebug() {
    const [info, setInfo] = useState({})

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const payload = parseJwt(token)
            setInfo({
                hasToken: true,
                role: getRole(token),
                name: getName(token),
                email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                allClaims: payload,
                tokenPreview: token.substring(0, 50) + '...'
            })
        } else {
            setInfo({ hasToken: false })
        }
    }, [])

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
            <div className="bg-white rounded-xl shadow-soft p-6">
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(info, null, 2)}
                </pre>
            </div>
            <div className="mt-4">
                <button
                    onClick={() => {
                        localStorage.removeItem('token')
                        window.location.reload()
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    Clear Token & Reload
                </button>
            </div>
        </div>
    )
}
