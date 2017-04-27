import React from 'react'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui-icons/Search';
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { List, ListItem, ListItemText } from 'material-ui/List'
import resource from 'fetch-resource'
import querystring from 'querystring'

import './App.css'
import SortSelect from './SortSelect'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      pageSize: 10,
      sort: 'citations',
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
    const { query, sort } = querystring.decode(search.replace(/^\?/, ''))

    this.setState({
      query: query,
      sort: sort || 'citations'
    })

    if (query) {
      setTimeout(() => this.search(), 0)
    }
  }

  search = (cursorMark = '*') => {
    const {query, sort, pageSize, response: {hitCount}} = this.state

    this.setState({response: {hitCount}})

    const sorts = {
      'citations': 'sort_cited:y',
      'relevance': null,
      'age': 'sort_newest:y',
    }

    const params = {
      query: [query, sorts[sort]].join(' '),
      resulttype: 'core',
      synonym: 'true',
      format: 'json',
      pageSize,
      cursorMark,
    }

    resource('https://www.ebi.ac.uk/europepmc/webservices/rest/search', params)
      .json()
      .then(response => this.setState({response}))
  }

  change = (event) => {
    this.setState({ query: event.target.value })
  }

  select = (selectedResult) => {
    this.setState({selectedResult})
  }

  submit = (event) => {
    event.preventDefault()
    this.transition(this.state.query, this.state.sort)
  }

  sort = (sort) => {
    this.transition(this.state.query, sort)
  }

  transition = (query, sort) => {
    this.props.history.push({ ...location, search: querystring.encode({ query, sort }) })
  }

  render () {
    const {query, response: {hitCount, nextCursorMark, resultList}, selectedResult, sort} = this.state

    return (
      <div id="container">
        <div id="form">
          { hitCount && <div>{hitCount.toLocaleString()} results</div> }

          <div>
            <SortSelect selected={sort} options={{
              'citations': 'Most cited first',
              'relevance': 'Most relevant first',
              'age': 'Most recent first'
            }} onChange={this.sort}/>
          </div>
        </div>

        <div id="results">
          <form onSubmit={this.submit}>
            <div style={{display: 'flex'}}>
              <TextField name="query" value={query} style={{flex: 1}}
                         onChange={this.change}/>
              <IconButton type="submit"><SearchIcon/></IconButton>
            </div>
          </form>

          <List>
            {resultList && resultList.result.map(result => (
              <ListItem button key={result.id}>
                <ListItemText primary={result.title.replace(/\.$/, '')}
                              onClick={() => this.select(result)}/>
              </ListItem>
            ))}
          </List>

          {nextCursorMark && <Button style={{width:'100%'}}
                                     onClick={() => this.search(query, nextCursorMark)}>Next page</Button>}
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
