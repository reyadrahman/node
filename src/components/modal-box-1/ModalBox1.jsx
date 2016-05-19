import React from 'react';
import Modal from 'react-modal';

export const ModalBox = React.createClass({
    render() {
        const { isOpen, children, styles, styles: { modalBox1: ss },
                title, className, overlayClassName, onRequestClose } = this.props;
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
                {children}
            </Modal>
        );
    },
});

export const Separator = ({ styles: { modalBox1: ss } }) => (
    <div className={ss.horSeparator} />
);

export default ModalBox;
