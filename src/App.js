import React from 'react'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui-icons/Search';
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { List } from 'material-ui/List'
import resource from 'fetch-resource'
import querystring from 'querystring'

import './App.css'
import SortSelect from './SortSelect'
import Article from './Article'
import Item from './Item'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      typedQuery: '',
      pageSize: 7,
      sort: 'citations',
      response: {},
      cursor: '*',
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
    const { query, sort, cursor, selected } = querystring.decode(search.replace(/^\?/, ''))

    const prevState = Object.assign({}, this.state)

    this.setState({
      query,
      typedQuery: query,
      cursor: cursor || '*',
      sort: sort || 'citations',
      selected
    })

    setTimeout(() => {
      if (this.state.query && (
        this.state.query !== prevState.query
        || this.state.cursor !== prevState.cursor
        || this.state.sort !== prevState.sort
      )) {
        this.fetch()
      }
    }, 10)
  }

  fetch = () => {
    const {query, sort, cursor, pageSize, response: {hitCount}} = this.state

    this.setState({response: {hitCount}})

    const sorts = {
      'citations': 'sort_cited:y',
      'relevance': null,
      'date': 'sort_date:y',
    }

    const params = {
      query: [query, 'src:med', sorts[sort]].join(' '),
      resulttype: 'lite',
      synonym: 'true',
      format: 'json',
      pageSize,
      cursorMark: cursor,
    }

    resource('https://www.ebi.ac.uk/europepmc/webservices/rest/search', params)
      .json()
      .then(response => {
        this.setState({response})
        if (response.hitCount) {
          this.select(response.resultList.result[0].pmid)
        }
      })
  }

  search = (query, sort) => {
    this.transition(query, sort || this.state.sort)
  }

  change = (event) => {
    this.setState({ typedQuery: event.target.value })
  }

  select = (selected) => {
    const {query, sort, cursor} = this.state
    this.transition(query, sort, cursor, selected)
  }

  submit = (event) => {
    event.preventDefault()
    this.search(this.state.typedQuery)
  }

  sort = (sort) => {
    const {query} = this.state
    this.transition(query, sort)
  }

  transition = (query, sort, cursor, selected) => {
    this.props.history.push({ ...location, search: querystring.encode({ query, sort, cursor, selected }) })
  }

  render () {
    const {typedQuery, query, response: {hitCount, nextCursorMark, resultList}, selected, sort} = this.state

    return (
      <div id="container">
        <div id="results">
          <form onSubmit={this.submit}>
            <div style={{display: 'flex'}}>
              <TextField name="query"
                     value={typedQuery}
                     placeholder="Enter search terms…"
                     style={{flex: 1}}
                     onChange={this.change}/>
              <IconButton type="submit"><SearchIcon/></IconButton>
            </div>
          </form>

          {!query && <div>^ Enter query terms to search PubMed via Europe PubMed Central</div>}

          {!!hitCount && <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Button>{hitCount.toLocaleString()} results</Button>

            <SortSelect selected={sort} options={{
              'citations': 'Most cited first',
              'relevance': 'Most relevant first',
              'date': 'Most recent first'
            }} onChange={this.sort}/>

            <Button style={{visibility: nextCursorMark ? 'visible' : 'hidden'}}
                     onClick={() => this.transition(query, sort, nextCursorMark)}>Next page</Button>
          </div>}

          {resultList && <List>
            {resultList.result.map(item => <Item key={item.id} result={item} select={this.select} selected={item.id === selected}/>)}
            </List>}
        </div>

        <div id="item">
          {selected && <Article pmid={selected} select={this.select} search={this.search}/>}
        </div>
      </div>
    )
  }
}
