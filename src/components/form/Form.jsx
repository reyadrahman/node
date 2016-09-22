import React from 'react';
import { Glyphicon } from 'react-bootstrap';

export const Form = React.createClass({
    render() {
        const { children, className, onSubmit, buttons } = this.props;

        return (
            <form
                className={`form-comp ${className || ''}`}
                onSubmit={onSubmit}
            >
                {children}
                {
                    buttons &&
                        <ButtonArea>
                        {
                            buttons.map(b => (
                                <Button
                                    type={b.type}
                                    label={b.label}
                                    onClick={b.onClick}
                                />
                            ))
                        }
                        </ButtonArea>
                }
            </form>
        );
    }
});

export const Input = ({
    type, className, value, icon, placeholder, onChange, ...others
}) => (
    <div className={`input-container ${className || ''}`} {...others}>
        <input
            type={type || 'text'}
            className="input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {icon && <div className="ver-separator" />}
        {icon && <Glyphicon glyph={icon} className="icon" />}
    </div>
);

export const TextArea = ({ className, ...others }) => (
    <textArea className={`text-area ${className || ''}`} {...others} />
);


export const Button = ({ label, className, type }) => (
    <button
        type={type}
        className={`button ${className || ''} ${type === 'submit' ? 'submit' : ''}`}
    >
        {label}
    </button>
);

export const ButtonArea = ({ className, children }) => (
    <div
        className={`button-area ${className || ''}`}
    >
        {children}
    </div>
);

export const ErrorMessage = ({ className, message }) => (
    <div
        className={`error ${className || ''}`}
    >
        {message}
    </div>
);

export const SuccessMessage = ({ className, message }) => (
    <div
        className={`success ${className || ''}`}
    >
        {message}
    </div>
);

export default Form;
