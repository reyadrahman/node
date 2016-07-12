// originally taken from https://github.com/fraserxu/react-dropdown

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.value || {
                label: props.placeholder || 'Select...',
                value: '',
            },
            isOpen: false,
        };
        this.mounted = true;
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.fireChangeEvent = this.fireChangeEvent.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.value && newProps.value.value !== this.state.selected.value) {
            this.setState({ selected: newProps.value });
        } else if (!newProps.value && newProps.placeholder) {
            this.setState({ selected: { label: newProps.placeholder, value: '' } });
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.handleDocumentClick, false);
        document.addEventListener('touchend', this.handleDocumentClick, false);
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener('click', this.handleDocumentClick, false);
        document.removeEventListener('touchend', this.handleDocumentClick, false);
    }

    handleMouseDown(event) {
        if (event.type === 'mousedown' && event.button !== 0) return;
        event.stopPropagation();
        event.preventDefault();

        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    optionSelected(value, label) {
        let newSelected = {
            value,
            label,
        };
        let newState = {
            isOpen: false,
        };
        this.fireChangeEvent(newSelected);
        this.setState(newState);
    }

    fireChangeEvent(newSelected) {
        if (newSelected.value !== this.state.selected.value && this.props.onChange) {
            this.props.onChange(newSelected);
        }
    }

    renderOption(option) {
        let optionClass = classNames({
            [`${this.props.baseClassName}-option`]: true,
            'is-selected': option === this.state.selected,
        });

        let value = option.value || option.label || option;
        let label = option.label || option.value || option;

        return (
      <div
          key={value}
          className={optionClass}
          onMouseDown={this.optionSelected.bind(this, value, label)}
          onClick={this.optionSelected.bind(this, value, label)}
      >
        {label}
      </div>
    );
    }

    buildMenu() {
        let { options, baseClassName } = this.props;
        let ops = options.map((option) => {
            if (option.type === 'group') {
                let groupTitle = (<div className={`${baseClassName}-title`}>{option.name}</div>);
                let _options = option.items.map((item) => this.renderOption(item));

                return (
          <div className={`${baseClassName}-group`} key={option.name}>
            {groupTitle}
            {_options}
          </div>
        );
            } else {
                return this.renderOption(option);
            }
        });

        return ops.length ? ops : <div className={`${baseClassName}-noresults`}>No options found</div>;
    }

    handleDocumentClick(event) {
        if (this.mounted) {
            if (!ReactDOM.findDOMNode(this).contains(event.target)) {
                this.setState({ isOpen: false });
            }
        }
    }

    render() {
        const { baseClassName, small } = this.props;
        const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label;
        let value = (<div className={`${baseClassName}-placeholder`}>{placeHolderValue}</div>);
        let menu = this.state.isOpen ? <div className={`${baseClassName}-menu`}>{this.buildMenu()}</div> : null;

        let dropdownClass = classNames({
            [`${baseClassName}-root`]: true,
            'is-open': this.state.isOpen,
            small,
        });

        return (
      <div className={dropdownClass}>
        <div className={`${baseClassName}-control`} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)}>
          {value}
          <span className={`${baseClassName}-arrow`} />
        </div>
        {menu}
      </div>
    );
    }

}

Dropdown.defaultProps = { baseClassName: 'Dropdown' };
export default Dropdown;
