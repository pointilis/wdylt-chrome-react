import { NavLink } from "react-router"
import "../index.css";
import "../App.css";

const Nav = () => {
    return (
        <ul className="flex Navlink gap-3 relative">
            <li>
                <NavLink to="/" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'Submit'}</NavLink>
            </li>

            <li>
                <NavLink to="/notes" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'My Learns'}</NavLink>
            </li>

            <li>
                <NavLink to="/tags" className="px-2 py-1 text-base border border-neutral-400 rounded-full" end>{'Tags'}</NavLink>
            </li>
        </ul>
    )
}

export default Nav;