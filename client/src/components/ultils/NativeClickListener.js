import React from 'react'
import PropTypes from 'prop-types'

export default class NativeClickListener extends React.Component {
    static propsType = {
        onClick: PropTypes.func
    }
    componentDidMount() {
        document.addEventListener('click', this.globalClickHandler)
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.globalClickHandler)
    }
    globalClickHandler = (nativeEvent) => {
        if (this._container && this._container.contains(nativeEvent.target)) return
        this.props.onClick(nativeEvent)
    }
    render() {
        return (
            <div ref={ref => this._container = ref}>
                { this.props.children}
            </div>
        )
    }
}