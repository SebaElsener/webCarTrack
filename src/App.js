import './App.css'
import NavBar from './components/NavBar/NavBar'
import ItemListContainer from './components/ItemListContainer/ItemListContainer'
import ItemDetailContainer from './components/ItemListContainer/ItemList/Item/ItemDetailContainer/ItemDetailContainer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import CartDetailContainer from './components/CartDetail/CartDetailContainer'
import CheckoutContainer from './components/Checkout/CheckoutContainer'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className='App'>
          <header className='App-header'>
            <NavBar />
          </header>
          <Routes>
            <Route path='/' element={<ItemListContainer greeting={'Ofertas sugeridas del día'} />} />
            <Route path='/Category/:categoryId' element={<ItemListContainer />} />
            <Route path='/Item/:id' element={<ItemDetailContainer />} />
            <Route path='/Cart' element={<CartDetailContainer />} />
            <Route path='/Checkout' element={<CheckoutContainer />} />
          </Routes>
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
