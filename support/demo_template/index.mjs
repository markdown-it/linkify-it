import linkifyit from '../../index.mjs'
import * as mdurl from 'mdurl'
const linkify = linkifyit({ fuzzyIP: true })
let source
let result
let permalink
let clear

function escape (str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function setLinkifiedContent (el, content) {
  let out = escape(content)
  const matches = linkify.match(content)

  if (matches) {
    const result = []
    let last = 0
    matches.forEach(function (match) {
      if (last < match.index) {
        result.push(escape(content.slice(last, match.index)).replace(/\r?\n/g, '<br>'))
      }
      result.push('<a target="_blank" href="')
      result.push(escape(match.url))
      result.push('">')
      result.push(escape(match.text))
      result.push('</a>')
      last = match.lastIndex
    })
    if (last < content.length) {
      result.push(escape(content.slice(last)).replace(/\r?\n/g, '<br>'))
    }
    out = result.join('')
  }

  el.innerHTML = out
}

function updateResult () {
  const text = source.value

  setLinkifiedContent(result, text)

  if (text) {
    permalink.href = `#t1=${mdurl.encode(text, mdurl.encode.componentChars)}`
  } else {
    permalink.href = ''
  }
}

window.onload = () => {
  permalink = document.getElementById('permalink')
  clear = document.querySelector('.source-clear')
  source = document.querySelector('.source')
  result = document.querySelector('.result-html')

  // Restore content if opened by permalink
  if (location.hash && /^(#t1=)/.test(location.hash)) {
    source.value = mdurl.decode(location.hash.slice(4), mdurl.decode.componentChars)
  }

  // Setup listeners
  let timer

  source.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(updateResult, 300)
  })

  clear.addEventListener('click', (event) => {
    source.value = ''
    updateResult()
    event.preventDefault()
  })

  updateResult()
}
