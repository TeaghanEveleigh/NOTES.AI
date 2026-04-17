'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const QuillEditor = forwardRef<any, QuillEditorProps>(
  ({ value, onChange, placeholder = 'Write something...' }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);

    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current,
    }));

    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder,
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['blockquote', 'code-block'],
              ['link'],
              ['clean'],
            ],
          },
        });

        quillRef.current.on('text-change', () => {
          if (quillRef.current) {
            const html = quillRef.current.root.innerHTML;
            onChange(html);
          }
        });
      }

      return () => {
        // Cleanup not needed for Quill
      };
    }, []);

    useEffect(() => {
      if (quillRef.current && value !== quillRef.current.root.innerHTML) {
        quillRef.current.root.innerHTML = value;
      }
    }, [value]);

    return (
      <>
        <style jsx global>{`
          .ql-toolbar.ql-snow {
            background: #f8f9fa;
            border-color: #ddd;
            border-radius: 10px 10px 0 0;
          }

          .ql-container.ql-snow {
            background: #fff;
            border-color: #ddd;
            border-radius: 0 0 10px 10px;
            min-height: 42vh;
          }

          .ql-editor {
            min-height: 40vh;
          }

          @media (prefers-color-scheme: dark) {
            .ql-toolbar.ql-snow {
              background: #1f1f1f;
              border-color: #2a2a2a;
            }

            .ql-container.ql-snow {
              background: #1f1f1f;
              border-color: #2a2a2a;
              color: #eaeaea;
            }

            .ql-editor {
              color: #eaeaea;
            }

            .ql-picker,
            .ql-stroke {
              color: #eaeaea;
              stroke: #eaeaea;
            }

            .ql-fill {
              fill: #eaeaea;
            }

            .ql-picker-options {
              background: #1f1f1f;
            }
          }
        `}</style>
        <div ref={editorRef} />
      </>
    );
  }
);

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
