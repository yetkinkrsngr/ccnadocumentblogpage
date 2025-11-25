import { useState } from 'react'

export default function Newsletter() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3000)
            return
        }

        setStatus('loading')

        // Simulate API call (you can implement actual newsletter service later)
        setTimeout(() => {
            setStatus('success')
            setEmail('')
            setTimeout(() => setStatus('idle'), 5000)
        }, 1000)
    }

    return (
        <section className="container-custom py-16">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-[hsl(var(--color-border))] p-8 md:p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>

                {/* Decorative Shapes */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-6 animate-float">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="gradient-text">Yeni İçeriklerden</span> Haberdar Olun
                    </h2>

                    {/* Description */}
                    <p className="text-base md:text-lg text-[hsl(var(--color-text-secondary))] mb-8">
                        CCNA eğitim içeriklerimiz ve güncellemeler hakkında bilgi almak için e-posta listemize katılın.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-posta adresiniz"
                                className="input flex-1"
                                disabled={status === 'loading' || status === 'success'}
                                required
                            />
                            <button
                                type="submit"
                                className="btn btn-primary px-6 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={status === 'loading' || status === 'success'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Gönderiliyor...
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Kaydedildi!
                                    </>
                                ) : (
                                    <>
                                        Abone Ol
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <p className="mt-4 text-sm text-green-600 dark:text-green-400 animate-slide-down">
                                ✓ Teşekkürler! E-posta listemize başarıyla kaydoldunuz.
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400 animate-slide-down">
                                ✗ Lütfen geçerli bir e-posta adresi girin.
                            </p>
                        )}
                    </form>

                    {/* Privacy Note */}
                    <p className="mt-6 text-xs text-[hsl(var(--color-text-tertiary))]">
                        E-posta adresinizi asla üçüncü taraflarla paylaşmayız. İstediğiniz zaman abonelikten çıkabilirsiniz.
                    </p>
                </div>
            </div>
        </section>
    )
}
