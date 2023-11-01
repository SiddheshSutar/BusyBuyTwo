'use client'
import React, { useState } from 'react';
import styles from './index.module.scss'

const Content = ({
    children
}) => {

    return (
        <div className={styles.red}>
           {children}
        </div>
    )
}

export default Content;