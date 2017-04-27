import React from 'react'
import { ListItem, ListItemText } from 'material-ui/List'

module.exports = ({ result, select }) => (
  <ListItem button key={result.id} onClick={() => select(result.pmid || result.id)}>
    <ListItemText primary={(result.title || 'Untitled').replace(/\.$/, '')}/>
  </ListItem>
)
