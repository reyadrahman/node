import React from 'react';
import Modal from 'react-modal';
import { Glyphicon } from 'react-bootstrap';

export const ModalBox = React.createClass({
    render() {
        const { isOpen, children, title, className, overlayClassName,
                onRequestClose } = this.props;
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className={`modal-content ${className || ''}`}
                overlayClassName={`modal-overlay ${overlayClassName || ''}`}
            >

                <Glyphicon
                    glyph="remove"
                    className="close-button"
                    onClick={onRequestClose}
                />
                {children}
            </Modal>
        );
    },
});

export const Title = ({ title }) => (
    <div className="title" >
        <h2>{title}</h2>
        <div className="hor-separator" />
    </div>
);

export default ModalBox;
