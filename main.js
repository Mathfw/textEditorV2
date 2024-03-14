import './style.css'
import { Editor } from './editor'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1 class="editor-heading">Text Editor</h1>
    <div id="editor" class="editor" contenteditable="true">
      texto texto texto </br>
      texto <b>texto</b> texto </br>
      <div>texto <i>texto</i> texto</div>
    </div>
  </div>
`

let editor = new Editor("editor");



