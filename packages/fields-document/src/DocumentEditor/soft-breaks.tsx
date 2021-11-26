import { MutableRefObject, useEffect, useRef } from 'react';
import { Transforms, Editor } from 'slate';

export function withSoftBreaks(
  isShiftPressedRef: MutableRefObject<boolean>,
  editor: Editor
): Editor {
  const { insertBreak } = editor;
  // TODO: should soft breaks only work in particular places
  editor.insertBreak = () => {
    if (isShiftPressedRef.current) {
      Transforms.insertText(editor, '\n');
    } else {
      insertBreak();
    }
  };
  return editor;
}

export function useKeyDownRef(targetKey: string) {
  const ref = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== targetKey) return;
      ref.current = true;
    };

    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key !== targetKey) return;
      ref.current = false;
    };

    document.addEventListener('keydown', handleKeyDown, { passive: true });
    document.addEventListener('keyup', handleKeyUp, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKey]);

  return ref;
}
