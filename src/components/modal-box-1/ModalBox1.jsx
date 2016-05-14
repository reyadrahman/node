import React from 'react';
import Modal from 'react-modal';

export const ModalBox = React.createClass({
    render() {
        const { isOpen, errorMessage, successMessage, children, styles,
                styles: { modalBox1: ss }, title, className, overlayClassName,
                onRequestClose } = this.props;
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className={`${ss.modalContent} ${className || ''}`}
                overlayClassName={`${ss.modalOverlay} ${overlayClassName || ''}`}
            >

                <div
                    className={ss.closeButton}
                    onClick={onRequestClose}
                />
                <h2 className={ss.title}>{title}</h2>
                {children}
                <div className={ss.error}>
                    {errorMessage}
                </div>
                <div className={ss.success}>
                    {successMessage}
                </div>
            </Modal>
        );
    },
});

export const Input = ({ type, className, styles: { modalBox1: ss }, ...others }) => (
    <input
        type={type || 'text'}
        className={`${ss.input} ${className || ''}`}
        {...others}
    />
);

export const Button = ({ label, className, type, styles: { modalBox1: ss } }) => (
    <button
        type={type}
        className={`${ss.button} ${className || ''}`}
    >
        {label}
    </button>
);


export default ModalBox;
