const Node = require('./utils/Node');
const { encodeLink } = require('./utils/URL');

module.exports = {
  embed: {
    formula: function(src) {
      this.append('$' + src + '$');
    },
    image: function(src) {
      this.append('![](' + encodeLink(src) + ')');
    },
    // Not a default Quill feature, converts custom divider embed blot added when
    // creating quill editor instance.
    // See https://quilljs.com/guides/cloning-medium-with-parchment/#dividers
    thematic_break: function() {
      this.open = '\n---\n' + this.open;
    },
  },

  inline: {
    italic: function() {
      return ['_', '_'];
    },
    bold: function() {
      return ['**', '**'];
    },
    link: function(url) {
      return ['[', '](' + url + ')'];
    },
    code: function() {
      return ['`', '`'];
    },
  },

  block: {
    'header': function({header}) {
      this.open = '#'.repeat(header) + ' ' + this.open;
    },
    blockquote: function() {
      this.open = '> ' + this.open;
    },
    'code-block': function() {
      this.open = '```' + this.open;
    },
    'align': function() {
      if (this.children && this.children.length &&
            this.children[0].text &&
            this.children[0].text.startsWith('$') &&
            this.children[0].text.endsWith('$')) {
        this.open = '$' + this.open;
        this.close = '$' + this.close;
      }
    },
    'list': {
      group: function() {
        return new Node(['', '\n']);
      },
      line: function(attrs, group) {
        if (attrs.list === 'bullet') {
          this.open = '- ' + this.open;
        } else if (attrs.list === "checked") {
          this.open = '- [x] ' + this.open;
        } else if (attrs.list === "unchecked") {
          this.open = '- [ ] ' + this.open;
        } else if (attrs.list === 'ordered') {
          group.count = group.count || 0;
          var count = ++group.count;
          this.open = count + '. ' + this.open;
        }
      },
    }
  },
}
