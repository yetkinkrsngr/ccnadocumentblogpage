export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} CCNA Blog • Tüm hakları saklıdır.</p>
        <p className="text-gray-500">Türkçe CCNA eğitim blogu</p>
      </div>
    </footer>
  )
}

