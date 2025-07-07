(() => {
  const gallery = document.querySelectorAll('.gallery img');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn = document.getElementById('saveBtn');

  let stickers = [];
  let undoStack = [];
  let redoStack = [];
  let currentImg = null;

  function cloneList(list) {
    return list.map(s => ({ ...s }));
  }

  function pushState() {
    undoStack.push(cloneList(stickers));
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stickers) {
      const img = new Image();
      img.src = s.src;
      ctx.drawImage(img, s.x, s.y, s.w, s.h);
    }
  }

  gallery.forEach(img => {
    img.addEventListener('dragstart', e => {
      currentImg = img;
      const rect = img.getBoundingClientRect();
      const ghost = img.cloneNode();
      ghost.style.position = 'absolute';
      ghost.style.width = rect.width + 'px';     // match grid thumbnail size
      ghost.style.height = rect.height + 'px';
      ghost.style.top = '-999px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
      setTimeout(() => document.body.removeChild(ghost), 0);
    });
  });

  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', e => {
    e.preventDefault();
    const box = canvas.getBoundingClientRect();
    const scaleX = canvas.width / box.width;
    const scaleY = canvas.height / box.height;
    const x = (e.clientX - box.left) * scaleX;
    const y = (e.clientY - box.top) * scaleY;
    const rect = currentImg.getBoundingClientRect();
    const w = rect.width * scaleX;
    const h = w * (currentImg.naturalHeight / currentImg.naturalWidth);

    stickers.push({ src: currentImg.src, x: x - w / 2, y: y - h / 2, w, h });
    pushState();
    render();
  });

  // undo, redo, reset, save
  undoBtn.addEventListener('click', () => {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop());
      stickers = cloneList(undoStack[undoStack.length - 1]);
      render();
    }
  });
  redoBtn.addEventListener('click', () => {
    if (redoStack.length) {
      stickers = cloneList(redoStack.pop());
      undoStack.push(cloneList(stickers));
      render();
    }
  });
  resetBtn.addEventListener('click', () => {
    stickers = [];
    undoStack = [];
    redoStack = [];
    pushState();
    render();
  });
  saveBtn.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'composition.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  pushState();
})();
