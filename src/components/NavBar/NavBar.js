
import { NavLink } from 'react-router-dom'
import CartWidget from '../CartWidget/CartWidget.js'
import './NavBar.css'

function NavBar() {
    return (
        <nav>
            <div className='navBrand'>
                <h1 className='brandName'><NavLink className='link' to={'/'}><span className='IE'>IE</span> Reparaciones</NavLink></h1>
            </div>
            <ul>
                <li><NavLink className='link' to={'/Category/celulares_y_tablets'}>CELULARES Y TABLETS</NavLink></li>
                <li><NavLink className='link' to={'/Category/notebook'}>NOTEBOOK</NavLink></li>
                <li><NavLink className='link' to={'/Category/PC'}>PC</NavLink></li>
                <li><NavLink className='link' to={'/'}>INICIO</NavLink></li>
                <li className='carrito'><NavLink className='linkCarrito' to='/Cart'><CartWidget /></NavLink></li>
            </ul>
        </nav>
    )
}

export default NavBar