import { Link } from 'react-router-dom'

export default function Hero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            {/* Gradient Background */}
            <div className="absolute inset-0 gradient-hero opacity-10"></div>

            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container-custom relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--color-bg-secondary))] border border-[hsl(var(--color-border))] mb-6 animate-slide-down">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                            Türkçe CCNA Eğitim Platformu
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
                        <span className="gradient-text">CCNA</span> Öğrenme{' '}
                        <br className="hidden md:block" />
                        Yolculuğunuz Başlıyor
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-[hsl(var(--color-text-secondary))] mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        IP Adresleme, Subnetting, Routing, Switching ve Güvenlik konularında
                        kapsamlı Türkçe içeriklerle ağ uzmanlığınızı geliştirin.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/kategoriler" className="btn btn-primary text-base px-8 py-3 shadow-lg hover:shadow-xl">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Kategorileri Keşfet
                        </Link>
                        <Link to="/hakkinda" className="btn btn-secondary text-base px-8 py-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Daha Fazla Bilgi
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">50+</div>
                            <div className="text-sm text-[hsl(var(--color-text-tertiary))]">Eğitim İçeriği</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">5</div>
                            <div className="text-sm text-[hsl(var(--color-text-tertiary))]">Ana Kategori</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">100%</div>
                            <div className="text-sm text-[hsl(var(--color-text-tertiary))]">Türkçe</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">Ücretsiz</div>
                            <div className="text-sm text-[hsl(var(--color-text-tertiary))]">Erişim</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full h-16 md:h-24 text-[hsl(var(--color-bg))]" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" />
                </svg>
            </div>
        </section>
    )
}
