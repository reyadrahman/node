import React from 'react';

export const Form = React.createClass({
    render() {
        const { children, styles, styles: { form: ss }, className,
                onSubmit, buttons } = this.props;

        return (
            <form
                className={`${ss.root} ${className || ''}`}
                onSubmit={onSubmit}
            >
                {children}
                {
                    buttons &&
                        <ButtonArea styles={styles}>
                        {
                            buttons.map(b => (
                                <Button
                                    type={b.type}
                                    label={b.label}
                                    styles={styles}
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
    type, className, value, icon, placeholder, onChange,
    styles: { form: ss }, ...others
}) => (
    <div className={`${ss.inputContainer} ${className || ''}`} {...others}>
        <input
            type={type || 'text'}
            className={ss.input}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {icon && <div className={`${ss.verSeparator}`} />}
        {icon && <div className={`${icon} ${ss.icon}`} />}
    </div>
);

export const TextArea = ({ className, styles: { form: ss }, ...others }) => (
    <textArea className={`${ss.textArea} ${className || ''}`} {...others} />
);


export const Button = ({ label, className, type, styles: { form: ss } }) => (
    <button
        type={type}
        className={`${ss.button} ${className || ''} ${type === 'submit' ? ss.submit : ''}`}
    >
        {label}
    </button>
);

export const ButtonArea = ({ className, children, styles: { form: ss } }) => (
    <div
        className={`${ss.buttonArea} ${className || ''}`}
    >
        {children}
    </div>
);

export const ErrorMessage = ({ className, message, styles: { form: ss} }) => (
    <div
        className={`${ss.error} ${className || ''}`}
    >
        {message}
    </div>
);

export const SuccessMessage = ({ className, message, styles: { form: ss} }) => (
    <div
        className={`${ss.success} ${className || ''}`}
    >
        {message}
    </div>
);

export default Form;
