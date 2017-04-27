import React from 'react'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui-icons/Search';
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { List, ListItem, ListItemText } from 'material-ui/List'
import { Menu, MenuItem } from 'material-ui/Menu'
import resource from 'fetch-resource'
import querystring from 'querystring'

import './App.css'

class SortSelect extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      anchorEl: undefined,
      selectedIndex: props.selected,
    }
  }

  handleListItemClick = (event) => {
    this.setState({open: true, anchorEl: event.currentTarget});
  }

  handleMenuItemClick = (selectedIndex) => {
    this.setState({selectedIndex, open: false})
    this.props.onChange(selectedIndex)
  }

  render () {
    const { options } = this.props
    const { selectedIndex, anchorEl, open } = this.state

    return (
      <div>
        <List>
          <ListItem button onClick={this.handleListItemClick}>
            <ListItemText primary="Sort" secondary={options[selectedIndex]} />
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

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      pageSize: 10,
      sort: 'sort_cited:y',
      response: {},
      selectedResult: null,
    }
  }

  componentDidMount () {
    this.setup(this.props.location.search)
  }

  componentWillReceiveProps (nextProps) {
    this.setup(nextProps.location.search)
  }

  setup (search) {
    const { query } = querystring.parse(search.replace(/^\?/, ''))

    if (query && query !== this.state.query) {
      this.search(query)
    }
  }

  search = (query, cursorMark = '*') => {
    const {history} = this.props
    const {sort, pageSize, response: {hitCount}} = this.state

    if (cursorMark === '*') {
      history.push('?query=' + encodeURIComponent(query))
    }

    this.setState({query, response: {hitCount}})

    const queryParts = [query, sort]

    const params = {
      query: queryParts.join(' '),
      resulttype: 'core',
      synonym: 'true',
      format: 'json',
      pageSize,
      cursorMark,
    }

    resource('https://www.ebi.ac.uk/europepmc/webservices/rest/search', params)
      .json()
      .then(response => { this.setState({response}) })
  }

  change = (event) => {
    this.setState({ query: event.target.value })
  }

  select = (selectedResult) => {
    this.setState({selectedResult})
  }

  submit = (event) => {
    event.preventDefault();
    this.search(this.state.query)
  }

  sort = (sort) => {
    console.log('sort', sort)
    this.setState({ sort })
    setTimeout(() => this.search(this.state.query), 0)
  }

  render () {
    const {query, response: {hitCount, nextCursorMark, resultList}, selectedResult, sort, pageSize} = this.state

    return (
      <div id="container">
        <div id="form">
          { hitCount && <div>{hitCount.toLocaleString()} results</div> }

          <div>
            <SortSelect options={{
              'sort_cited:y': 'Most cited first',
              '': 'Most relevant first',
              'sort_date:y': 'Most recent first'
            }} onChange={this.sort} selected={sort}/>
          </div>
        </div>

        <div id="results">
          <form onSubmit={this.submit}>
            <div style={{display: 'flex'}}>
              <TextField name="query" value={query} onChange={this.change} style={{flex: 1}}/>
              <IconButton type="submit"><SearchIcon/></IconButton>
            </div>
          </form>

          <List>
            {resultList && resultList.result.map(result => (
              <ListItem button key={result.id}>
                <ListItemText primary={result.title.replace(/\.$/, '')} onClick={() => this.select(result)}/>
              </ListItem>
            ))}
          </List>

          {nextCursorMark && resultList.result.length === pageSize && <Button style={{width:'100%'}}
                                     onClick={() => this.search(query, nextCursorMark)}>Next page {nextCursorMark}</Button>}
        </div>

          <div id="item">
            { selectedResult && (
              <div>
                <div id="title">{selectedResult.title.replace(/\.$/, '')}</div>
                <p>{selectedResult.abstractText}</p>
              </div>
            )}
          </div>
      </div>
    )
  }
}
