import React from 'react';
import Modal from 'react-modal';

export const ModalBox = React.createClass({
    render() {
        const { isOpen, errorMessage, successMessage, children, styles,
                styles: { modalBox1: ss }, title, className, overlayClassName,
                onSubmit, onRequestClose, buttons } = this.props;
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className={`${ss.modalContent} ${className || ''}`}
                overlayClassName={`${ss.modalOverlay} ${overlayClassName || ''}`}
            >

                <div
                    className={`${ss.closeButton} icon-cancel`}
                    onClick={onRequestClose}
                />
                <h2 className={ss.title}>{title}</h2>
                <Separator styles={styles} />
                <form className={ss.form} onSubmit={onSubmit}>
                    {children}
                    <div className={ss.error}>
                        {errorMessage}
                    </div>
                    <div className={ss.success}>
                        {successMessage}
                    </div>
                    <ButtonArea styles={styles}>
                        {
                            buttons && buttons.map(b => (
                                <Button
                                    type={b.type}
                                    className={`${ss.button} ` +
                                        `${b.type === 'submit' ? ss.submit : ''}`}
                                    label={b.label}
                                    styles={styles}
                                    onClick={b.onClick}
                                />
                            ))
                        }
                    </ButtonArea>
                </form>
            </Modal>
        );
    },
});

export const Input = ({
    type, className, icon, placeholder,
    styles: { modalBox1: ss }, ...others
}) => (
    <div className={`${ss.inputContainer} ${className || ''}`} {...others}>
        <input
            type={type || 'text'}
            className={ss.input}
            placeholder={placeholder}
        />
        {icon && <div className={`${ss.verSeparator}`} />}
        {icon && <div className={`${icon} ${ss.icon}`} />}
    </div>
);

export const Button = ({ label, className, type, styles: { modalBox1: ss } }) => (
    <button
        type={type}
        className={`${ss.button} ${className || ''}`}
    >
        {label}
    </button>
);

export const ButtonArea = ({ className, children, styles: { modalBox1: ss } }) => (
    <div
        className={`${ss.buttonArea} ${className || ''}`}
    >
        {children}
    </div>
);


export const Separator = ({ styles: { modalBox1: ss } }) => (
    <div className={ss.horSeparator} />
);


export default ModalBox;
