import { Link } from 'react-router-dom'

export default function Dashboard(){
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-semibold mb-2">Yazılar</h2>
        <Link to="/admin/yazilar" className="text-blue-600">Yazıları yönet</Link>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-semibold mb-2">Kategoriler</h2>
        <Link to="/admin/kategoriler" className="text-blue-600">Kategorileri yönet</Link>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-semibold mb-2">Yorumlar</h2>
        <Link to="/admin/yorumlar" className="text-blue-600">Yorumları yönet</Link>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-semibold mb-2">Medya</h2>
        <Link to="/admin/medya" className="text-blue-600">Medya yöneticisi</Link>
      </div>
    </div>
  )
}

