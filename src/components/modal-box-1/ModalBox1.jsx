import React from 'react';
import Modal from 'react-modal';
import { Glyphicon } from 'react-bootstrap';

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

                <Glyphicon
                    glyph="remove"
                    className={ss.closeButton}
                    onClick={onRequestClose}
                />
                {
                // <h2 className={ss.title}>{title}</h2>
                // <Separator styles={styles} />
                }
                {children}
            </Modal>
        );
    },
});

export const Title = ({ styles: { modalBox1: ss }, title }) => (
    <div className={ss.title} >
        <h2>{title}</h2>
        <div className={ss.horSeparator} />
    </div>
);

export default ModalBox;
