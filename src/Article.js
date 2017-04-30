import React from 'react'
import resource from 'fetch-resource'
import Button from 'material-ui/Button'

export default class Article extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      article: undefined,
      references: undefined,
      citations: undefined
    }
  }

  componentDidMount () {
    this.fetch(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.match.params.pmid !== this.props.match.params.pmid) {
      this.fetch(nextProps)
    }
  }

  fetch = ({ match }) => {
    this.setState({ article: undefined, references: undefined, citations: undefined })

    const params = {
      query: 'src:med ext_id:' + match.params.pmid,
      resulttype: 'core',
      format: 'json',
    }

    return resource('https://www.ebi.ac.uk/europepmc/webservices/rest/search', params)
      .json()
      .then(({resultList}) => this.setState({article: resultList.result[0]}))
  }

  render () {
    const {search, select, total} = this.props
    const {article} = this.state

    if (!article) return null

    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={() => select(null)}>Back to {total.toLocaleString()} results</Button>

          {article.citedByCount > 0 && <Button
            onClick={() => search(`CITES:${article.id}_MED`, 'citations')}>Cited
            by {article.citedByCount.toLocaleString()}</Button>}

          {article.hasReferences === 'Y' && <Button
            onClick={() => search(`REFFED_BY:${article.id}_MED`)}>References</Button>}
        </div>

        <div id="title">{article.title.replace(/\.$/, '')}</div>

        <p>{article.abstractText}</p>

        <div>{ article.authorList.author.map((author, index) => <span className="author" key={index} onClick={() => search(`AUTHOR:"${author.fullName}"`)}>{author.fullName}</span>)}</div>
      </div>
    )
  }
}
