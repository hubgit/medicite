import React from 'react'
import { List, ListItem, ListItemText } from 'material-ui/List'
import { Menu, MenuItem } from 'material-ui/Menu'

export default class SortSelect extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      anchorEl: undefined,
      selectedIndex: null,
    }
  }

  componentDidMount () {
    this.setState({selectedIndex: this.props.selected})
  }

  componentWillReceiveProps (nextProps) {
    this.setState({selectedIndex: nextProps.selected})
  }

  handleListItemClick = (event) => {
    this.setState({open: true, anchorEl: event.currentTarget});
  }

  handleMenuItemClick = (selectedIndex) => {
    this.setState({selectedIndex, open: false})
    this.props.onChange(selectedIndex)
  }

  render () {
    const {options} = this.props
    const {selectedIndex, anchorEl, open} = this.state

    return (
      <div>
        <List>
          <ListItem button onClick={this.handleListItemClick}>
            <ListItemText primary="Sort" secondary={options[selectedIndex]}/>
          </ListItem>
        </List>

        <Menu anchorEl={anchorEl} open={open} onRequestClose={() => this.setState({open: false})}>
          {Object.keys(options).map((index) => (
            <MenuItem key={index}
                      selected={index === selectedIndex}
                      onClick={() => this.handleMenuItemClick(index)}>{options[index]}</MenuItem>
          ))}
        </Menu>
      </div>
    )
  }
}
