import { CKEditor } from "@ckeditor/ckeditor5-react"
import { 
    Bold,
    Image,
    CKFinder,
    CKFinderUI,
    CKFinderUploadAdapter,
    ClassicEditor,
    Essentials,
    Font,
    FontColor,
    FontFamily,
    FontSize,
    Italic,
    Link,
    Paragraph,
    ImageUpload,
    ImageInsertUI,
    SimpleUploadAdapter,
    List,
    TodoList,
    TodoListUI,
    TodoListEditing,
    Underline,
    UnderlineEditing,
    UnderlineUI,
    AutoLink,
    CodeBlock,
    CodeBlockEditing,
    CodeBlockUI
} from "ckeditor5"
import 'ckeditor5/ckeditor5.css';
import { forwardRef, useImperativeHandle, useState } from "react";
import '../App.css';

const RicnEditor = forwardRef((props: {
    content?: string
    onBlur?: any
    onChange?: any
}, ref) => {
    const [editorInstance, setEditorInstance] = useState<ClassicEditor | null>(null);
    useImperativeHandle(ref, () => ({
        reset() {
            editorInstance?.setData('');
        },
        setData(value: string) {
            editorInstance?.setData(value);
        }
    }))

    return(
        <div className="formatted">
            <CKEditor 
                editor={ ClassicEditor }
                config={ {
                    licenseKey: 'GPL',
                    plugins: [
                        Essentials, 
                        Paragraph, 
                        Bold, 
                        Link,
                        Italic,
                        Font,
                        FontColor,
                        FontFamily,
                        FontSize,
                        Image,
                        CKFinder,
                        CKFinderUI,
                        CKFinderUploadAdapter,
                        ImageUpload,
                        ImageInsertUI, 
                        SimpleUploadAdapter,
                        List,
                        TodoList,
                        TodoListUI,
                        TodoListEditing,
                        Underline,
                        UnderlineEditing,
                        UnderlineUI,
                        Link,
                        AutoLink,
                        CodeBlock,
                        CodeBlockEditing,
                        CodeBlockUI,
                    ],
                    fontColor: {
                        columns: 6,
                        colorPicker: {
                            format: 'hex',
                        },
                        colors: [
                            {
                                color: '#000000',
                                label: 'Black'
                            },
                            {
                                color: '#4D4D4D',
                                label: 'Dim grey'
                            },
                            {
                                color: '#E64C4C',
                                label: 'Red'
                            },
                            {
                                color: '#E6994C',
                                label: 'Orange'
                            },
                            {
                                color: '#E6E64C',
                                label: 'Yellow'
                            },
                            {
                                color: '#4CE64C',
                                label: 'Green'
                            },
                            {
                                color: '#4CE699',
                                label: 'Aquamarine'
                            },
                            {
                                color: '#4CE6E6',
                                label: 'Turquoise'
                            },
                            {
                                color: '#4C4CE6',
                                label: 'Blue'
                            },
                            {
                                color: '#994CE6',
                                label: 'Purple'
                            }
                        ],
                    },
                    toolbar: [
                        'undo', 'redo',
                        'fontsize', 'fontColor',
                        'bold', 'underline',
                        'numberedList', 'bulletedList',
                        'codeBlock',
                    ],
                    initialData: props.content,
                    placeholder: 'Write something here...',
                } }
                onReady={ ( editor) => {
                    setEditorInstance(editor);
                }}
                onChange={ ( event, editor ) => {
                    props.onChange(editor.getData());
                }}
                onBlur={ ( event, editor ) => {
                    props.onBlur(editor.getData());
                }}
            />
        </div>
    )
})

export default RicnEditor;