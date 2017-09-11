const { isEmpty } = require('lodash')
const commonmark = require('commonmark')
const converters = require('./toDelta.converters')
const { applyAttribute } = require('./utils/DOM')
const Delta = require('quill-delta')

function toDelta(markdown) {
  var parsed = toDelta.commonmark.parse(markdown)
  var walker = parsed.walker()
  var event, node
  var deltas = new Delta()
  var attributes = {}
  var lineAttributes = {}

  while ((event = walker.next())) {
    node = event.node
    for (var i = 0; i < toDelta.converters.length; i++) {
      const converter = toDelta.converters[i]
      console.log(node.type);
      if (node.type == converter.filter) {
        if (converter.lineAttribute) {
          applyAttribute(node, event, lineAttributes, converter.attribute)
        } else {
          applyAttribute(node, event, attributes, converter.attribute)
        }
        if (converter.makeDelta) {
          let delta = converter.makeDelta(
            event,
            converter.lineAttribute ? lineAttributes : attributes
          )
          if (delta) {
            deltas.push(delta)
          }
        }
        break
      }
    }
  }
  if (isEmpty(deltas.ops) || deltas.ops[deltas.ops.length - 1].insert.indexOf('\n') == -1) {
    deltas.push({ insert: '\n' })
  }

  return deltas.ops
}

toDelta.commonmark = new commonmark.Parser()
toDelta.converters = converters

module.exports = toDelta
