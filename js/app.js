// js/app.js
(() => {
  // — Referințe DOM —
  const gallery  = document.querySelectorAll('.gallery img');
  const canvas   = document.getElementById('canvas');
  const ctx      = canvas.getContext('2d');
  const undoBtn  = document.getElementById('undoBtn');
  const redoBtn  = document.getElementById('redoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn  = document.getElementById('saveBtn');

  // — State —
  let stickers   = [];   // lista curentă de {src, x, y, w, h}
  let undoStack  = [];   // stive pentru undo
  let redoStack  = [];   // stive pentru redo
  let currentImg = null; // thumbnail-ul pe care-l tragi

  // — Helper: clonare shallow a listei —
  function cloneList(list) {
    return list.map(s => ({ ...s }));
  }

  // — Activează/dezactivează butoane Undo/Redo —
  function updateButtons() {
    undoBtn.disabled = undoStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
  }

  // — Push state: salvează copia curentă înainte de orice schimbare —
  function pushState() {
    undoStack.push(cloneList(stickers));
    redoStack = [];
    updateButtons();
  }

  // — Render: curăță și redesenează toate stickerele din listă —
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stickers.forEach(st => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, st.x, st.y, st.w, st.h);
      };
      img.src = st.src;
    });
  }

  // — Inițial: stare goală pentru undoStack —
  pushState();

  // — Custom drag‐image & rețin thumbnail-ul curent —
  gallery.forEach(img => {
    img.addEventListener('dragstart', e => {
      currentImg = img;

      // 1. Calculăm offset-ul cursorului în interiorul imaginii
      const rect = img.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;

      // 2. Creăm un <canvas> off-screen la dimensiunea thumbnail-ului
      const dragCanvas = document.createElement('canvas');
      dragCanvas.width  = rect.width;
      dragCanvas.height = rect.height;
      const dctx = dragCanvas.getContext('2d');

      // 3. Desenăm thumbnail-ul pe acest canvas (opac, fără ghost)
      dctx.drawImage(img, 0, 0, rect.width, rect.height);

      // 4. Setăm custom drag image
      e.dataTransfer.setDragImage(dragCanvas, offX, offY);
    });
  });

  // — Permit drop pe canvas —
  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', e => {
    e.preventDefault();
    if (!currentImg) return;

    // 1. Factorii de scalare CSS → coordonate interne
    const scaleX = canvas.width  / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    // 2. Coordonatele interne exacte unde s-a dat drop
    const box  = canvas.getBoundingClientRect();
    const intX = (e.clientX - box.left) * scaleX;
    const intY = (e.clientY - box.top ) * scaleY;

    // 3. Dimensiuni intern executate din aspect-ratio original
    const cssRect = currentImg.getBoundingClientRect();
    const cssW    = cssRect.width;
    const ratio   = currentImg.naturalHeight / currentImg.naturalWidth;
    const intW    = cssW * scaleX;
    const intH    = cssW * ratio * scaleY;

    // 4. Adăugăm un nou sticker în listă și salvăm starea pentru undo
    stickers.push({
      src: currentImg.src,
      x:   intX - intW / 2,
      y:   intY - intH / 2,
      w:   intW,
      h:   intH
    });
    pushState();

    // 5. Redesenăm întreg canvas-ul
    render();
  });

  // — Undo: șterge ultimul sticker —
  undoBtn.addEventListener('click', () => {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop());
      stickers = cloneList(undoStack[undoStack.length - 1]);
      render();
      updateButtons();
    }
  });

  // — Redo: reintroduce ultimul sticker —
  redoBtn.addEventListener('click', () => {
    if (redoStack.length) {
      const next = redoStack.pop();
      undoStack.push(next);
      stickers = cloneList(next);
      render();
      updateButtons();
    }
  });

  // — Reset: golește toate stickerele —
  resetBtn.addEventListener('click', () => {
    stickers = [];
    pushState();
    render();
  });

  // — Save as PNG: creăm dinamic un link și declanșăm descărcarea —
  saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'composition.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
const tabs = document.querySelectorAll('.tabs button');
const allImgs = document.querySelectorAll('.gallery img');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    allImgs.forEach(img => {
      if (filter === 'all' || img.classList.contains(filter)) {
        img.style.display = 'block';
      } else {
        img.style.display = 'none';
      }
    });
  });
});
})();
