const isEmpty = require('lodash/isEmpty')
const { changeAttribute } = require('./utils/DOM')

function addOnEnter(name) {
  return (event, attributes) => {
    if (!event.entering) {
      return null
    }
    return {
      insert: event.node.literal,
      attributes: Object.assign({}, attributes, { [name]: true }),
    }
  }
}

function onlyInsert(event) {
  if (!event.entering) {
    return null
  }
  return {
    insert: event.node.literal,
  }
}

const converters = [
  // inline
  { filter: 'code', makeDelta: addOnEnter('code') },
  { filter: 'html_inline', makeDelta: onlyInsert },
  { filter: 'underline', makeDelta: addOnEnter('underline') },
  { filter: 'strikethrough', makeDelta: addOnEnter('strikethrough') },
  { filter: 'emph', attribute: 'italic' },
  { filter: 'strong', attribute: 'bold' },
  // TODO: script
  {
    filter: 'link',
    attribute: (node, event, attributes) => {
      changeAttribute(attributes, event, 'link', node.destination)
    },
  },
  {
    filter: 'text',
    makeDelta: (event, attributes) => {
      if (isEmpty(attributes)) {
        return { insert: event.node.literal }
      } else {
        console.log(attributes);
        return {
          insert: event.node.literal,
          attributes: Object.assign({}, attributes),
        }
      }
    },
  },
  {
    filter: 'softbreak',
    makeDelta: (event, attributes) => {
      if (isEmpty(attributes)) {
        return { insert: ' ' }
      } else {
        return { insert: ' ', attributes: Object.assign({}, attributes) }
      }
    },
  },

  // block
  { filter: 'block_quote', lineAttribute: true, attribute: 'blockquote' },
  {
    filter: 'code_block',
    lineAttribute: true,
    makeDelta: addOnEnter('code-block'),
  },
  {
    filter: 'heading',
    lineAttribute: true,
    makeDelta: (event, attributes) => {
      if (event.entering) {
        return null
      }
      const numbers = ['one', 'two', 'three', 'four', 'five']
      return {
        insert: '\n',
        attributes: Object.assign({}, attributes, {
          type: `header-${numbers[event.node.level - 1]}`
        }),
      }
    },
  },
  {
    filter: 'list',
    lineAttribute: true,
    attribute: (node, event, attributes) => {
      switch (node.listType) {
        case 'bullet':
          changeAttribute(attributes, event, 'type', 'unordered-list-item')
          break;
        case 'ordered':
          changeAttribute(attributes, event, 'type', 'ordered-list-item')
          break;
        default:
      }
    },
  },
  {
    filter: 'paragraph',
    lineAttribute: true,
    makeDelta: (event, attributes) => {
      if (event.entering) {
        return null
      }

      if (isEmpty(attributes)) {
        return { insert: '\n' }
      } else {
        return { insert: '\n', attributes: Object.assign({}, attributes) }
      }
    },
  },

  // embeds
  {
    filter: 'image',
    attribute: (node, event, attributes) => {
      changeAttribute(attributes, event, 'image', node.destination)
      if (node.title) {
        changeAttribute(attributes, event, 'title', node.title)
      }
    },
  },
]

module.exports = converters
