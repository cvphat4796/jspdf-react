import jsPDF from 'jspdf'
import 'jspdf-autotable'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const { Provider, Consumer } = React.createContext()

class PDF extends Component {
  static propTypes = {
    orientation: PropTypes.oneOf(['portrait', 'landscape', 'p', 'l']),
    unit: PropTypes.oneOf(['pt', 'mm', 'cm', 'in']),
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    hotfixes: PropTypes.array,
    save: PropTypes.bool,
    filename: PropTypes.string,
    preview: PropTypes.bool,
    previewWidth: PropTypes.number,
    previewHeight: PropTypes.number,
    autoPrint: PropTypes.bool,
    children: PropTypes.node,
    language: PropTypes.string,
    properties: PropTypes.shape({})
  }

  static defaultProps = {
    save: false,
    autoPrint: false,
    preview: false,
    previewWidth: 600,
    previewHeight: 900,
    language: 'en-US',
    properties: {}
  }

  constructor(props) {
    super(props)
    const {
      orientation, unit, format, hotfixes
    } = props
    var doc = new jsPDF({
      orientation,
      unit,
      format,
      hotfixes
    })
    this.state = {
      callChildren: 0,
      doc
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.orientation !== this.props.orientation) {
      return true
    }
    if (nextProps.unit !== this.props.unit) {
      return true
    }
    if (nextProps.format !== this.props.format) {
      return true
    }
    if (nextState.callChildren <= this.props.children.length) {
      return true
    }
    return false
  }

  addProperty = (property) => {
    this.setState(prevState => ({
      doc: property,
      callChildren: prevState.callChildren + 1 })
    )
  }

  render() {
    const {
      save,
      filename,
      preview,
      previewWidth,
      previewHeight,
      children,
      autoPrint,
      language,
      properties
    } = this.props
    const { doc, callChildren } = this.state

    let contentIframe = null
    const isLoad = callChildren === children.length
    const content = (
      <Provider value={{
        doc: doc,
        addProperty: this.addProperty
      }}>
        {children}
      </Provider>
    )
    doc.setProperties(properties)
    doc.setLanguage(language)
    if (isLoad && save) {
      if (autoPrint) doc.autoPrint()
      doc.save(filename)
    } else if (isLoad && preview) {
      const uri = doc.output('datauristring')
      contentIframe = <iframe frameBorder='0' width={previewWidth} height={previewHeight} src={uri} />
    }
    return (
      <React.Fragment>
        {contentIframe}
        {content}
      </React.Fragment>
    )
  }
}

export default PDF
