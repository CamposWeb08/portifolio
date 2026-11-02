/**
 * Portfólio Campos - Interatividade da Seção Hero
 * - Alternância de tema claro/escuro com persistência via localStorage
 * - Parallax tático espacial (concentric rings, court lines, typography)
 * - Restrições para mobile e prefers-reduced-motion
 * - Rolagem suave do botão CTA
 */

const THEME_STORAGE_KEY = 'campos-theme';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initInkTitles();
  initHeroParallax();
  initSmoothScroll();
});

/**
 * Inicializa o efeito de tinta nos títulos
 * No desktop, o preenchimento da esquerda para a direita ocorre via CSS :hover.
 * No celular / touch, o preenchimento é acionado ao tocar (toggle interativo).
 */
function initInkTitles() {
  const inkTitles = document.querySelectorAll('.ink-title, .hero-name');
  if (!inkTitles.length) return;

  inkTitles.forEach(title => {
    // Ao tocar no celular ou clicar, ativa o preenchimento de tinta dourada
    title.addEventListener('click', () => {
      const isNowFilled = title.classList.toggle('is-ink-filled');

      // Se ativado no toque em dispositivo móvel, reseta automaticamente após 3.2s se não tocado de novo
      if (isNowFilled && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        clearTimeout(title._inkTimer);
        title._inkTimer = setTimeout(() => {
          title.classList.remove('is-ink-filled');
        }, 3200);
      }
    });

    // Se o usuário tocar fora do título no celular, remove a tinta com transição suave
    document.addEventListener('touchstart', (e) => {
      if (!title.contains(e.target) && title.classList.contains('is-ink-filled')) {
        title.classList.remove('is-ink-filled');
      }
    }, { passive: true });
  });
}

/**
 * Controla a alternância e sincronização do tema claro/escuro
 * Usa variáveis CSS definidas em :root e [data-theme="light"]
 * Salva a preferência do usuário no localStorage
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;

  // Função para aplicar o tema e atualizar os atributos de acessibilidade
  const applyTheme = (theme, saveToStorage = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    const isLight = theme === 'light';
    themeToggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    
    const label = isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro';
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.setAttribute('title', label);

    if (saveToStorage) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (err) {
        console.warn('Não foi possível salvar a preferência no localStorage:', err);
      }
    }
  };

  // Identifica o tema inicial já configurado pelo script inline ou localStorage
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(currentTheme, false);

  // Alterna o tema ao clicar no botão
  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  // Ouve mudanças de preferência no SO apenas se o usuário não escolheu manualmente
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const hasManualPreference = localStorage.getItem(THEME_STORAGE_KEY);
    if (!hasManualPreference) {
      applyTheme(e.matches ? 'dark' : 'light', false);
    }
  });
}

/**
 * Inicializa o efeito de profundidade tática (Parallax 3D)
 * Inspirado nas transições táteis e atmosféricas de Cactus Digitale e Lusion.
 */
function initHeroParallax() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth <= 768;

  // No celular ou se o usuário preferir redução de movimento, desativa o parallax
  if (isReducedMotion || isTouchDevice || isMobile) {
    return;
  }

  const concentricSystem = document.getElementById('concentricSystem');
  const tacticalField = document.getElementById('tacticalField');
  const titleWrapper = document.getElementById('heroTitleWrapper');

  if (!concentricSystem || !tacticalField || !titleWrapper) return;

  // Posições normalizadas (-1 a 1)
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isTicking = false;

  const onMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    // Centraliza coordenadas entre -1 e 1
    targetX = (e.clientX / innerWidth - 0.5) * 2;
    targetY = (e.clientY / innerHeight - 0.5) * 2;

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  const updateParallax = () => {
    // Interpolação suave (lerp) para sensação orgânica e fluida
    const ease = 0.08;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    // 1. Círculos concêntricos e iluminação de fundo (movimento lento)
    const bgX = currentX * 22;
    const bgY = currentY * 16;
    concentricSystem.style.setProperty('--parallax-bg-x', `${bgX.toFixed(2)}px`);
    concentricSystem.style.setProperty('--parallax-bg-y', `${bgY.toFixed(2)}px`);

    // 2. Linhas do campo e quadra de futevôlei (movimento intermediário com inclinação 3D)
    const fieldX = currentX * 38;
    const fieldY = currentY * 28;
    tacticalField.style.setProperty('--parallax-field-x', `${fieldX.toFixed(2)}px`);
    tacticalField.style.setProperty('--parallax-field-y', `${fieldY.toFixed(2)}px`);

    // 3. Tipografia monumental (contra-deslocamento sutil para sensação de profundidade)
    const titleX = -currentX * 12;
    const titleY = -currentY * 8;
    titleWrapper.style.setProperty('--parallax-title-x', `${titleX.toFixed(2)}px`);
    titleWrapper.style.setProperty('--parallax-title-y', `${titleY.toFixed(2)}px`);

    // Continua a animação enquanto houver deslocamento significativo
    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      requestAnimationFrame(updateParallax);
    } else {
      isTicking = false;
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Listener para redimensionamento de janela
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      window.removeEventListener('mousemove', onMouseMove);
      concentricSystem.style.removeProperty('--parallax-bg-x');
      concentricSystem.style.removeProperty('--parallax-bg-y');
      tacticalField.style.removeProperty('--parallax-field-x');
      tacticalField.style.removeProperty('--parallax-field-y');
      titleWrapper.style.removeProperty('--parallax-title-x');
      titleWrapper.style.removeProperty('--parallax-title-y');
    }
  }, { passive: true });
}

/**
 * Garante rolagem suave nativa para links âncora (menu e botão de ação)
 */
function initSmoothScroll() {
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}
