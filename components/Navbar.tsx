'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="navbar navbar-default navbar-shadow">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#myNavbar"
            aria-expanded="false"
          >
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link href="/" className="navbar-brand">
            NOTES.AI
          </Link>
        </div>

        <div className="collapse navbar-collapse" id="myNavbar">
          <ul className="nav navbar-nav navbar-right">
            {status === 'authenticated' ? (
              <>
                <li id="home" className={isActive('/') ? 'active' : ''}>
                  <Link href="/">HOME</Link>
                </li>
                <li id="about" className={isActive('/Get-started') ? 'active' : ''}>
                  <Link href="/Get-started">GET STARTED</Link>
                </li>
                <li id="contact" className={isActive('/contact') ? 'active' : ''}>
                  <Link href="/contact">CONTACT US</Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '15px',
                      color: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <>
                <li id="about" className={isActive('/Get-started') ? 'active' : ''}>
                  <Link href="/Get-started">GET STARTED</Link>
                </li>
                <li id="contact" className={isActive('/contact') ? 'active' : ''}>
                  <Link href="/contact">CONTACT US</Link>
                </li>
                <li id="login" className={isActive('/login') ? 'active' : ''}>
                  <Link href="/login">LOGIN</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
