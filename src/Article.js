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
    this.fetch(this.props.pmid)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pmid !== this.props.pmid) {
      this.fetch(nextProps.pmid)
    }
  }

  fetch = (pmid) => {
    this.setState({ article: undefined, references: undefined, citations: undefined })

    const params = {
      query: 'src:med ext_id:' + pmid,
      resulttype: 'core',
      format: 'json',
    }

    return resource('https://www.ebi.ac.uk/europepmc/webservices/rest/search', params)
      .json()
      .then(({resultList}) => this.setState({article: resultList.result[0]}))
  }

  render () {
    const {search} = this.props
    const {article} = this.state

    if (!article) return null

    return (
      <div>
        <div id="title">{article.title.replace(/\.$/, '')}</div>
        <p>{article.abstractText}</p>

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {article.citedByCount > 0 && <Button
            onClick={() => search(`CITES:${article.id}_MED`, 'citations')}>Cited by {article.citedByCount}</Button>}

          {article.hasReferences === 'Y' && <Button
            onClick={() => search(`REFFED_BY:${article.id}_MED`)}>References</Button>}
        </div>
      </div>
    )
  }
}
