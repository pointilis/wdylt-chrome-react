import { NavLink } from "react-router"
import "../index.css";
import "../App.css";

const Nav = () => {
    return (
        <ul className="flex Navlink gap-3 relative">
            <li>
                <NavLink to="/" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'Compose'}</NavLink>
            </li>

            <li>
                <NavLink to="/notes" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'Notes'}</NavLink>
            </li>

            <li>
                <NavLink to="/todos" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'Todos'}</NavLink>
            </li>
        </ul>
    )
}

export default Nav;