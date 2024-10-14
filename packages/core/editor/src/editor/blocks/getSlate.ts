import { SlateEditor, YooEditor, YooptaBlockData, YooptaPathIndex } from '../types';

export type GetSlateOptions = {
  at?: YooptaPathIndex;
  id?: string;
};

export function getSlate(editor: YooEditor, options: GetSlateOptions): SlateEditor {
  if (!options?.id && typeof options?.at !== 'number') {
    throw new Error('getSlate requires either an id or at');
  }

  const blockId =
    options?.id ||
    Object.keys(editor.children).find((childrenId) => {
      const plugin = editor.children[childrenId];
      return plugin.meta.order === options?.at;
    });

  const slate = editor.blockEditorsMap[blockId || ''];
  const blockData = editor.children[blockId || ''] as YooptaBlockData;
  const blockEntity = editor.blocks[blockData?.type || ''];

  if (!blockEntity?.hasCustomEditor && !slate) {
    throw new Error(`Slate not found with params: ${JSON.stringify(options)}`);
  }

  return slate;
}
