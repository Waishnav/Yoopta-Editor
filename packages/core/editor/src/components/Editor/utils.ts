import { buildBlockElement } from '../../editor/elements/utils';
import { YooptaBlockData, SlateElement, YooptaBlockBaseMeta } from '../../editor/types';
import { generateId } from '../../utils/generateId';

type BuildBlockDataOptions = Partial<YooptaBlockData<SlateElement>> & {
  value?: SlateElement[];
  meta?: Partial<YooptaBlockBaseMeta>;
};

export const buildBlockData = (block?: BuildBlockDataOptions): YooptaBlockData => ({
  id: block?.id || generateId(),
  value: block?.value || [buildBlockElement()],
  type: block?.type || 'Paragraph',
  meta: {
    order: 0,
    depth: 0,
    ...block?.meta,
  },
});

export const getDefaultYooptaChildren = () => {
  const pId = generateId();

  return {
    [pId]: buildBlockData({ id: pId }),
  };
};
