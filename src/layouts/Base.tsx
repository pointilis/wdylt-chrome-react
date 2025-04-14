import React, { useEffect, useState } from 'react';
import '../App.css';
import '../index.css';
import Nav from '../components/Nav';
import { useNavigate } from 'react-router';
import logo from '../logo.png';

const BaseLayout = ({ children }: {
    children: React.ReactNode
}) => {
    const title = 'What Did You Learn Today?';
    const [user, setUser] = useState<any>();
    const navigate = useNavigate();
    const runInChromeExt = window.chrome && chrome.runtime && chrome.runtime.id;

    const logoutHandler = async () => {
        if (runInChromeExt) {
            await chrome.storage.local.remove(["user"]);
        }

        navigate('/register', { replace: true });
    }

    useEffect(() => {
        if (runInChromeExt) {
            chrome.storage.local.get(["user"]).then((result: any) => {
                if (result && result.user) {
                    setUser(result.user);
                }
            });
        }
    }, [setUser, runInChromeExt]);

    return (
        <main className='Main p-4 text-lg'>
            <div className='fixed top-0 right-0 left-0 w-full z-10 p-3 bg-neutral-200 flex'>
                <div className='flex items-start'>
                    <div className='pr-4'><img src={logo} alt={title} className='w-16 h-16' /></div>
                    <div className='block'>
                        <div className='text-xl font-bold'>{title}</div>
                        <div className='block mb-2.5 text-red-700 text-sm'>{user ? user.user_email : null}</div>
                        <Nav />
                    </div>
                </div>

                <div className='ml-auto'>
                    <button type='button' onClick={logoutHandler} className='rounded-full px-3 py-1 text-sm text-red-700 border border-red-700'>{'Logout'}</button>
                </div>
            </div>
            <div className='py-4 pt-28'>
                {children}
            </div>
        </main>
    )
}

export default BaseLayout;