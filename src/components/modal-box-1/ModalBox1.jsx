import React from 'react';
import Modal from 'react-modal';

import styles from './modal-box-1.scss';

export const ModalBox = React.createClass({
    render() {
        let {isOpen, errorMessage, successMessage, children,
             title, className, overlayClassName, onRequestClose} = this.props;
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className={`${styles.modalContent} ${className || ''}`}
                overlayClassName={`${styles.modalOverlay} ${overlayClassName || ''}`}
            >

                <div
                    className={styles.closeButton}
                    onClick={onRequestClose}
                />
                <h2 className={styles.title}>{title}</h2>
                {children}
                <div className={styles.error}>
                    {errorMessage}
                </div>
                <div className={styles.success}>
                    {successMessage}
                </div>
            </Modal>
        );
    },
});

export const Input = ({type, className, ...others}) => (
    <input
        type={type || 'text'}
        className={`${styles.input} ${className || ''}`}
        {...others}
    />
);

export const Button = ({label, className, type}) => (
    <button
        type={type}
        className={`${styles.button} ${className || ''}`}
    >
        {label}
    </button>
);


export default ModalBox;
