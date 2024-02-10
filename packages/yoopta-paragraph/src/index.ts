import { ParagraphElement } from './types';
import { Paragraph } from './plugin';

declare module 'slate' {
  interface CustomTypes {
    Element: ParagraphElement;
  }
}

export default Paragraph;

export { ParagraphElement };
