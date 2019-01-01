export let hasBlock = (editorState, type) => {
  return editorState.blocks.some(node => node.type === type);
};

export let hasAncestorBlock = (editorState, type) => {
  return editorState.blocks.some(block => {
    return editorState.document.getClosest(block.key, parent => parent.type === type);
  });
};

export let getFiles = () =>
  new Promise(resolve => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      let files = input.files;
      Promise.all(
        [...files].map(file => {
          return new Promise(innerResolve => {
            const reader = new FileReader();
            reader.onload = e => {
              innerResolve(e.target.result);
            };
            reader.readAsDataURL(file);
          });
        })
      ).then(urls => {
        resolve(urls);
      });
    };
    input.click();
  });
