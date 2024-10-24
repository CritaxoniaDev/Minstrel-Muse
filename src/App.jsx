import './App.css'
import Header from './components/Header'
import Auth from './components/Auth/Auth'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Auth />
      </main>
    </div>
  )
}

export default App
