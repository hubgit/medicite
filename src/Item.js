import React from 'react'
import { ListItem, ListItemText } from 'material-ui/List'

module.exports = ({ result, select, selected }) => (
  <ListItem button key={result.id} style={{backgroundColor: selected ? '#eee' : 'transparent'}}
            onClick={() => select(result.pmid || result.id)}>
    <ListItemText primary={(result.title || 'Untitled').replace(/\.$/, '')}/>
  </ListItem>
)
