const enterBtn = document.getElementById('enterBtn');
enterBtn.addEventListener('click', function(e) {
  e.preventDefault();

  document.querySelector('.front-page').style.display = 'none';
  document.body.style.background = '#fff';
  const left = document.querySelector('.curtain.left');
  const right = document.querySelector('.curtain.right');
  left.style.display = 'block';
  right.style.display = 'block';

  requestAnimationFrame(() => {
    left.classList.add('open');
    right.classList.add('open');
  });

  setTimeout(() => {
    window.location.href = 'wardrobe.html';
  }, 600);
});
