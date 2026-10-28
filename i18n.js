/* i18n.js — internationalization module for quest-player
   Features:
   - Auto-detects browser language
   - Language switcher UI
   - Dynamic translation of all UI strings
   - Game content translation (story, puzzle, hints)
   - localStorage persistence
   - RTL language support
   - Plural rules
   - Date/number localization
*/

const I18n = {
  // Supported languages with metadata
  languages: {
    en: {
      name: 'English',
      nativeName: 'English',
      dir: 'ltr',
      flag: '🇺🇸',
      pluralRule: (n) => n === 1 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal' }
    },
    es: {
      name: 'Spanish',
      nativeName: 'Español',
      dir: 'ltr',
      flag: '🇪🇸',
      pluralRule: (n) => n === 1 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal' }
    },
    fr: {
      name: 'French',
      nativeName: 'Français',
      dir: 'ltr',
      flag: '🇫🇷',
      pluralRule: (n) => n < 2 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal', useGrouping: true }
    },
    de: {
      name: 'German',
      nativeName: 'Deutsch',
      dir: 'ltr',
      flag: '🇩🇪',
      pluralRule: (n) => n === 1 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal', useGrouping: true }
    },
    pt: {
      name: 'Portuguese',
      nativeName: 'Português',
      dir: 'ltr',
      flag: '🇧🇷',
      pluralRule: (n) => n === 1 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal', useGrouping: true }
    },
    it: {
      name: 'Italian',
      nativeName: 'Italiano',
      dir: 'ltr',
      flag: '🇮🇹',
      pluralRule: (n) => n === 1 ? 'one' : 'other',
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal', useGrouping: true }
    },
    ru: {
      name: 'Russian',
      nativeName: 'Русский',
      dir: 'ltr',
      flag: '🇷🇺',
      pluralRule: (n) => { let r10 = n % 10, r100 = n % 100; if (r10 === 1 && r100 !== 11) return 'one'; if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return 'few'; return 'many'; },
      dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      numberFormat: { style: 'decimal', useGrouping: true }
    },
  },

  // Current language
  current: 'en',

  // Translations cache
  translations: {},

  // Initialize i18n
  async init() {
    // Detect language from localStorage or browser
    let saved = null;
    try { saved = localStorage.getItem('lantern-lang'); } catch (e) { /* storage may be disabled */ }
    const browserLang = (navigator.language || 'en').split('-')[0];
    
    if (saved && this.languages[saved]) {
      this.current = saved;
    } else if (this.languages[browserLang]) {
      this.current = browserLang;
    } else {
      this.current = 'en';
    }

    // Load translations
    await this.loadTranslations(this.current);

    // Apply RTL if needed
    this.applyDirection();

    // Setup language switcher
    this.setupSwitcher();

    // Translate static content
    this.translateStatic();

    return this;
  },

  // Load translations for a language
  async loadTranslations(lang) {
    if (this.translations[lang]) return;

    try {
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) throw new Error('Translation not found');
      this.translations[lang] = await response.json();
    } catch (e) {
      console.warn(`Failed to load translations for ${lang}:`, e);
      // Fallback to English
      if (lang !== 'en') {
        await this.loadTranslations('en');
        this.translations[lang] = this.translations['en'];
      }
    }
  },

  // Get translation for a key
  t(key, params = {}) {
    const lang = this.current;
    const translations = this.translations[lang] || this.translations['en'] || {};
    let text = translations[key] || key;

    // Replace placeholders
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });

    return text;
  },

  // Change language
  async changeLanguage(lang) {
    if (!this.languages[lang]) return;

    this.current = lang;
    try { localStorage.setItem('lantern-lang', lang); } catch (e) { /* language still applies in memory */ }

    await this.loadTranslations(lang);
    this.applyDirection();
    this.translateStatic();
    this.setupSwitcher(); // Re-render switcher with new active

    // Dispatch event for game content re-translation
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  // Apply text direction
  applyDirection() {
    const dir = this.languages[this.current]?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = this.current;
  },

  // Format number according to locale
  formatNumber(n) {
    const lang = this.current;
    const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang;
    return new Intl.NumberFormat(locale).format(n);
  },

  // Format date according to locale
  formatDate(date) {
    const lang = this.current;
    const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang;
    return new Intl.DateTimeFormat(locale, this.languages[lang]?.dateFormat).format(date);
  },

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    const lang = this.current;
    const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang;
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  },

  // Pluralization
  plural(count, forms) {
    const rule = this.languages[this.current]?.pluralRule || ((n) => n === 1 ? 'one' : 'other');
    const form = rule(count);
    return forms[form] || forms.other || '';
  },

  // Setup language switcher UI
  setupSwitcher() {
    let switcher = document.getElementById('lang-switcher');
    if (!switcher) {
      // Create switcher if it doesn't exist
      switcher = document.createElement('div');
      switcher.id = 'lang-switcher';
      switcher.className = 'lang-switcher';
      
      // Insert after the first h1 or at the start of main
      const main = document.querySelector('main');
      if (main) {
        const firstH1 = main.querySelector('h1');
        if (firstH1 && firstH1.nextElementSibling) {
          firstH1.nextElementSibling.before(switcher);
        } else {
          main.insertBefore(switcher, main.firstChild);
        }
      }
    }

    // Render language buttons
    const current = this.current;
    switcher.innerHTML = Object.entries(this.languages).map(([code, meta]) => `
      <button class="lang-btn ${code === current ? 'active' : ''}" 
              data-lang="${code}" 
              title="${meta.name}">
        ${meta.flag} ${meta.nativeName}
      </button>
    `).join('');

    // Add click handlers
    switcher.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang !== this.current) {
          this.changeLanguage(lang);
        }
      });
    });
  },

  // Translate all static content with data-i18n attributes
  translateStatic() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const params = {};
      
      // Parse data-i18n-params='{"name": "John"}'
      if (el.dataset.i18nParams) {
        try {
          Object.assign(params, JSON.parse(el.dataset.i18nParams));
        } catch (e) {}
      }

      el.textContent = this.t(key, params);
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.t(key);
    });

    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      el.title = this.t(key);
    });

    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      el.setAttribute('aria-label', this.t(key));
    });
  },

  // Translate game content (called on language change)
  translateGameContent(pack) {
    if (!pack || !pack.stops) return pack;

    const lang = this.current;
    const translatedStops = pack.stops.map(stop => {
      const translated = { ...stop };

      // Translate story
      if (stop.story) {
        translated.story = {};
        Object.keys(stop.story).forEach(level => {
          const storyKey = `story_${stop.id}_${level}`;
          translated.story[level] = this.translations[lang]?.[storyKey] || stop.story[level];
        });
      }

      // Translate puzzle
      if (stop.puzzle) {
        translated.puzzle = {};
        Object.keys(stop.puzzle).forEach(level => {
          const puzzle = stop.puzzle[level];
          const puzzleKey = `puzzle_${stop.id}_${level}`;
          const answerKey = `answer_${stop.id}_${level}`;
          translated.puzzle[level] = {
            ...puzzle,
            q: this.translations[lang]?.[puzzleKey] || puzzle.q,
            a: this.translations[lang]?.[answerKey] || puzzle.a
          };
        });
      }

      // Translate hints
      if (stop.hints) {
        translated.hints = stop.hints.map((hint, i) => {
          const hintKey = `hint_${stop.id}_${i + 1}`;
          return this.translations[lang]?.[hintKey] || hint;
        });
      }

      // Translate fallback puzzle
      if (stop.fallback) {
        translated.fallback = {
          q: this.translations[lang]?.[`fallback_q_${stop.id}`] || stop.fallback.q,
          a: this.translations[lang]?.[`fallback_a_${stop.id}`] || stop.fallback.a
        };
      }

      // Translate wisp and lit lines
      if (stop.wisp) {
        translated.wisp = this.translations[lang]?.[`wisp_${stop.id}`] || stop.wisp;
      }
      if (stop.lit) {
        translated.lit = this.translations[lang]?.[`lit_${stop.id}`] || stop.lit;
      }

      // Translate name
      translated.name = this.translations[lang]?.[`stop_name_${stop.id}`] || stop.name;

      return translated;
    });

    return { ...pack, stops: translatedStops };
  }
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else if (typeof document !== 'undefined') {
  I18n.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
