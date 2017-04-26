import React from 'react'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui-icons/Search';
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { List, ListItem, ListItemText } from 'material-ui/List';
import resource from 'fetch-resource'
import querystring from 'querystring'

import './App.css'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      response: {},
      selectedResult: null,
    }
  }

  componentDidMount () {
    this.setup()
  }

  setup () {
    const {location: {search}} = this.props
    const { query } = querystring.parse(search.replace(/^\?/, ''))

    if (query) {
      this.search(query)
    }
  }

  search = (query, cursorMark = '*') => {
    const {history} = this.props
    const {response: {hitCount}} = this.state

    if (cursorMark === '*') {
      history.push('?query=' + query)
    }

    this.setState({query, response: {hitCount}})

    const queryParts = [query, 'sort_cited:y']

    const params = {
      query: queryParts.join(' '),
      resulttype: 'core',
      synonym: 'true',
      format: 'json',
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

  render () {
    const {query, response: {hitCount, nextCursorMark, resultList}, selectedResult} = this.state

    return (
      <div id="container">
        <div id="form">
          <form onSubmit={this.submit} style={{display: 'flex'}}>
            <TextField name="query" value={query} onChange={this.change}/>
            <IconButton type="submit"><SearchIcon/></IconButton>
          </form>

          { hitCount && <div>{hitCount} results</div> }
        </div>

        <div id="results">
          <List>
            {resultList && resultList.result.map(result => (
              <ListItem button key={result.id}>
                <ListItemText primary={result.title.replace(/\.$/, '')} onClick={() => this.select(result)}/>
              </ListItem>
            ))}
          </List>

          {nextCursorMark && <Button onClick={() => this.search(query, nextCursorMark)}>Next page</Button>}
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
