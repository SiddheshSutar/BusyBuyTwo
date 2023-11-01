'use client'
import React from 'react'
import styles from './index.module.scss'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { isLoggedInViaCheckingLocal, removeLogInFromLocal } from '../../../../helpers';

const Navbar = () => {

    const pathname = usePathname()

    const handleSignOut = e => {
        e.preventDefault()
        removeLogInFromLocal()
        window.open('/', '_self')
    }

    return (
        <div className={styles['main-nav']}>
            {/* <Image
                src={'/images/image-gallery.png'}
                width={50}
                height={50}
                style={{
                    color: '#fff'
                }}
            /> */}
            <p>
                <Link href="/">
                    Busy Buy
                </Link>
            </p>
            <div className={styles['side-nav']}>
                {
                    isLoggedInViaCheckingLocal() &&
                    <>
                        <div>
                            <Link href="/cart">
                                Cart
                            </Link>
                        </div>
                        <div>
                            <Link href="/orders">
                                Orders
                            </Link>
                        </div>
                        <div>
                            <Link href="/sign-out" onClick={e => handleSignOut(e)}>
                                Sign Out
                            </Link>
                        </div>
                    </>
                }
                <div>
                    {
                        pathname.includes('log-in') ?
                            <Link href="/sign-up">
                                Sign Up
                            </Link> : !isLoggedInViaCheckingLocal() ?
                                <Link href="/log-in">
                                    Log In
                                </Link> :
                                <></>
                    }
                </div>
            </div>
        </div>
    );
}

export default Navbar;