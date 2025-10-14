import CreateCards from './pages/CreateCards';
import Header from './components/Header';
import './App.css'

function App() {
  return (
    <div className="min-h-screen w-full text-[#3C2F2F]">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <CreateCards />
        </main>
      </div>
    </div>
  );
}

export default App
