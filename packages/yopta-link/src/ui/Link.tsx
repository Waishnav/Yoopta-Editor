import { MouseEvent } from 'react';
import { Editor, Element, Transforms } from 'slate';
import { getNodeByPath, YoptaPlugin, generateId } from '@yopta/editor';
import isUrl from 'is-url';
import { addLinkNode } from '../utils/addLink';
import { LinkEditor } from './LinkEditor';
import s from './Link.module.scss';

const LinkRender = ({ attributes, element, children }) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = new URL(element.url);

    if (url.host === window.location.host) {
      window.open(element.url, '_self');
    } else {
      window.open(element.url, '_blank');
    }
  };

  return (
    <a
      draggable={false}
      {...attributes}
      href={element.url}
      rel="noreferrer"
      target="_blank"
      className={s.link}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

LinkRender.displayName = 'Link';

const LINK_NODE_TYPE = 'link';

const Link = new YoptaPlugin({
  type: LINK_NODE_TYPE,
  renderer: {
    editor: () => LinkEditor,
    render: () => LinkRender,
  },
  element: {
    type: 'inline',
    isVoid: false,
  },
  extendEditor(editor) {
    const { insertData, insertText, isInline } = editor;

    editor.isInline = (element) => (element.type === LINK_NODE_TYPE ? true : isInline(element));

    editor.insertText = (text: string) => {
      console.log({ text });

      if (text && isUrl(text)) {
        addLinkNode(editor, text);
      } else {
        insertText(text);
      }
    };

    editor.insertData = (data) => {
      const text = data.getData('text/plain');

      console.log('insertData', text, isUrl(text));

      if (text && isUrl(text)) {
        addLinkNode(editor, text);
      } else {
        insertData(data);
      }
    };

    return editor;
  },
  handlers: {
    onKeyDown:
      (editor, { hotkeys }) =>
      (event) => {
        if (!editor.selection) return;
        const node = getNodeByPath(editor, editor.selection.anchor.path);

        if (node.type !== LINK_NODE_TYPE) return;
        const { anchor } = editor.selection;

        if (hotkeys.isEnter(event)) {
          const isEnd = Editor.isEnd(editor, anchor, anchor.path);
          const isStart = Editor.isStart(editor, anchor, anchor.path);

          if (isEnd) {
            event.preventDefault();
            Editor.insertBreak(editor);
            Transforms.setNodes(editor, { id: generateId() });
            Transforms.removeNodes(editor, {
              match: (n) => Element.isElement(n) && Editor.isInline(editor, n) && n.type === LINK_NODE_TYPE,
            });

            return;
          }

          if (!isEnd && !isStart) {
            event.preventDefault();
            Transforms.splitNodes(editor);
            Transforms.setNodes(editor, { id: generateId() });
            Transforms.setNodes(
              editor,
              { id: generateId() },
              { match: (n) => Element.isElement(n) && Editor.isInline(editor, n) && n.type === LINK_NODE_TYPE },
            );
          }

          return;
        }

        if (hotkeys.isSpace(event)) {
          const inline = Editor.above(editor, {
            match: (n) => Element.isElement(n) && Editor.isInline(editor, n) && n.type === LINK_NODE_TYPE,
            mode: 'highest',
          });

          if (inline) {
            const [, inlinePath] = inline;

            if (Editor.isEnd(editor, anchor, inlinePath)) {
              const afterPoint = Editor.after(editor, inlinePath)!;

              Transforms.setSelection(editor, {
                anchor: afterPoint,
                focus: afterPoint,
              });
            }
          }

          return;
        }
      },
  },
});

export { Link };
