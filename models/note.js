// models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: Object, default: null },        // tiptap JSON (ProseMirror)
  contentHtml: { type: String, default: '' },
  text: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
