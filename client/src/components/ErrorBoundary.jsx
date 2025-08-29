import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }
  componentDidCatch(error, info){
    // noop: could log to server
    console.error('UI Error:', error, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-900 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">Bir hata oluştu</h2>
            <p className="text-sm">Sayfa yüklenirken beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
