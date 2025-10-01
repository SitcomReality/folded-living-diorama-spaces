export class InfoBannerManager {
  constructor(element, messages) {
    this.el = element;
    this.allMessages = messages.slice();
    this.dismissed = new Set(JSON.parse(sessionStorage.getItem('dismissedInfoMessages') || '[]'));
    this.current = null;
    this.interval = null;
    this.closeBtn = null;
    this.init();
  }
  init() {
    this.el.innerHTML = ''; // clear existing
    this.el.classList.remove('visible');
    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'info-banner-close';
    this.closeBtn.textContent = '✕';
    this.closeBtn.addEventListener('click', () => {
      if (this.current) {
        this.dismissed.add(this.current);
        sessionStorage.setItem('dismissedInfoMessages', JSON.stringify([...this.dismissed]));
      }
      this.hide();
      this.scheduleNext();
    });
    this.scheduleNext(true);
  }
  availableMessages() {
    return this.allMessages.filter(m => !this.dismissed.has(m));
  }
  show(message) {
    this.current = message;
    this.el.innerHTML = message;
    this.el.appendChild(this.closeBtn);
    this.el.classList.add('visible');
    // auto-hide after calm linger
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.hide(), 7000);
  }
  hide() {
    this.el.classList.remove('visible');
  }
  scheduleNext(immediate = false) {
    const msgs = this.availableMessages();
    if (msgs.length === 0) {
      // nothing to show this session
      clearInterval(this.interval);
      this.interval = null;
      this.hide();
      return;
    }
    if (immediate) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = setTimeout(() => {
        const message = msgs[Math.floor(Math.random() * msgs.length)];
        this.show(message);
      }, 7000); // calmer initial delay
    }
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      const avail = this.availableMessages();
      if (avail.length === 0) { clearInterval(this.interval); this.interval = null; this.hide(); return; }
      const message = avail[Math.floor(Math.random() * avail.length)];
      this.show(message);
    }, 45000); // slower cycling
  }
}