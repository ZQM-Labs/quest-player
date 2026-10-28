/* global-story.js — global storytelling engine for quest-player
   Provides a cohesive narrative arc that works across cultures.
   Features:
   - Universal "light in darkness" theme
   - Cultural adaptation hooks for different regions
   - Character voice consistency
   - Seasonal flexibility (not just Halloween)
   - Emotional arc: loss → hope → triumph
   - Transition narratives between stops
   - Multiple story modes (Halloween, Lantern Festival, Summer Solstice, etc.)
*/

const GlobalStory = {
  // Story modes for different cultural contexts
  modes: {
    halloween: {
      id: 'halloween',
      name: 'Halloween',
      icon: '🎃',
      description: 'Spooky autumn hunt',
      season: 'autumn',
      theme: 'light vs darkness',
      intro: "On the night when the veil between worlds grows thin, Wisp the will-o'-the-wisp lost her six glow lanterns, and the road home went dark with them. Without them she cannot find her way home — and the shadows grow longer with every step not yet taken. You are her Lantern Keepers now: six stops, six lanterns, one road home. Bring the light back.",
      outro: "Six lanterns lit, six shadows sent home, and Wisp dances at the head of the parade she helped reclaim — the road home burning bright behind her, all the way home. The night belongs to those who carry light, Keepers, and tonight you carried it.",
      cultural_hooks: ['pumpkin', 'ghost', 'spooky', 'autumn', 'costume']
    },
    lantern_festival: {
      id: 'lantern_festival',
      name: 'Lantern Festival',
      icon: '🏮',
      description: 'Traditional lantern celebration',
      season: 'winter',
      theme: 'light and hope',
      intro: "During the festival of lights, when lanterns rise like stars on earth, Wisp's lanterns were scattered by the wind. Each one holds a wish, a prayer, a dream. Without them, the festival is incomplete.",
      outro: "The lanterns rise together, carrying the hopes of all who helped. The sky is full of light — and so is the heart of every Keeper.",
      cultural_hooks: ['lantern', 'festival', 'wish', 'hope', 'winter']
    },
    summer_solstice: {
      id: 'summer_solstice',
      name: 'Summer Solstice',
      icon: '☀️',
      description: 'Longest day celebration',
      season: 'summer',
      theme: 'peak light',
      intro: "On the longest day, when the sun should shine brightest, Wisp's lanterns were stolen by the night. Without them, the solstice is just another sunset. The light must be reclaimed.",
      outro: "The solstice sun meets the lantern light, and together they banish the night. The longest day ends with the brightest light — the light of Keepers.",
      cultural_hooks: ['sun', 'solstice', 'summer', 'longest_day', 'light']
    },
    spring_equinox: {
      id: 'spring_equinox',
      name: 'Spring Equinox',
      icon: '🌸',
      description: 'Balance of light and dark',
      season: 'spring',
      theme: 'balance and renewal',
      intro: "On the day when light and dark stand equal, Wisp's lanterns were scattered to the winds. Without them, the balance tips toward darkness. The equinox demands light.",
      outro: "The balance is restored. Light and dark stand equal once more, and Wisp's lanterns burn bright in the equilibrium. Every Keeper carries the balance forward.",
      cultural_hooks: ['equinox', 'balance', 'spring', 'renewal', 'flower']
    },
    diwali: {
      id: 'diwali',
      name: 'Diwali',
      icon: '🪔',
      description: 'Festival of lights',
      season: 'autumn',
      theme: 'victory of light',
      intro: "On the festival of lights, when lamps are lit to celebrate the triumph of light over darkness, Wisp's lanterns were stolen by the shadows. Without them, the festival is dim.",
      outro: "The lamps are lit, the shadows flee, and Wisp's lanterns burn bright in the victory of light. Every Keeper is a lamp bearer.",
      cultural_hooks: ['lamp', 'diwali', 'light', 'victory', 'festival']
    },
    mid_autumn: {
      id: 'mid_autumn',
      name: 'Mid-Autumn Festival',
      icon: '🌕',
      description: 'Moon and lantern celebration',
      season: 'autumn',
      theme: 'reunion and light',
      intro: "On the night of the full moon, when families gather and lanterns glow, Wisp's lanterns were lost to the shadows. Without them, the moon is just a circle, and the reunion is incomplete.",
      outro: "The full moon meets the lantern light, and the reunion is complete. Wisp dances in the moonbeams, and every Keeper is part of the family.",
      cultural_hooks: ['moon', 'reunion', 'family', 'lantern', 'full_moon']
    }
  },

  // Character profiles with voice consistency
  characters: {
    wisp: {
      name: 'Wisp',
      role: 'The Lost Light',
      voice: 'Energetic, hopeful, occasionally dramatic',
      arc: 'Despair → Hope → Triumph',
      catchphrases: {
        halloween: "Don't let the shadows win!",
        lantern_festival: "Every lantern carries a wish!",
        summer_solstice: "The longest day needs the brightest light!",
        spring_equinox: "Balance is power!",
        diwali: "Light conquers all!",
        mid_autumn: "Together we shine!"
      },
      emotions: {
        lost: "Where... where are my lanterns? I can't find my way without them.",
        hopeful: "Wait — is that light? Is someone there? Maybe... maybe there's still hope.",
        triumphant: "I can see the path! I can see HOME! You did it, Keepers!"
      }
    },
    drz: {
      name: 'Dr. Z',
      role: 'The Mad Scientist',
      voice: 'Manic, competitive, secretly supportive',
      arc: 'Rivalry → Respect → Partnership',
      catchphrases: {
        halloween: "FULL MADNESS engaged!",
        lantern_festival: "My lanterns are the brightest! Probably.",
        summer_solstice: "Science demands the best light!",
        spring_equinox: "Balance is overrated! CHAOS!",
        diwali: "My lamps are scientifically superior!",
        mid_autumn: "The moon is just a big lantern, you know."
      },
      emotions: {
        competitive: "I was faster at your age! (I wasn't, but still.)",
        impressed: "Hmm. Not bad, Keeper. Not bad at all.",
        supportive: "Fine. FINE. Here's a hint. But you didn't get it from me."
      }
    },
    professor_hoot: {
      name: 'Professor Hoot',
      role: 'The Wise Owl',
      voice: 'Calm, cryptic, scholarly',
      arc: 'Observation → Test → Approval',
      catchphrases: {
        halloween: "Whooo dares to enter my domain?",
        lantern_festival: "The festival of lights tests all who carry flames.",
        summer_solstice: "The longest day reveals the truest light.",
        spring_equinox: "Balance, young Keeper. Seek it.",
        diwali: "The lamp that burns brightest casts no shadow.",
        mid_autumn: "The moon does not shine alone — neither do you."
      },
      emotions: {
        testing: "Hmmm. Interesting. But is it... correct?",
        approving: "Well done, young Keeper. The light recognizes you.",
        cryptic: "The answer is not in the question, but in the asking."
      }
    }
  },

  // Universal themes that work across cultures
  themes: {
    light_vs_darkness: {
      name: 'Light vs Darkness',
      description: 'The eternal struggle between illumination and shadow',
      symbols: ['lantern', 'flame', 'star', 'moon', 'sun'],
      emotional_core: 'hope in the face of despair'
    },
    reunion: {
      name: 'Reunion',
      description: 'What was scattered is gathered; what was lost is found',
      symbols: ['lantern', 'family', 'circle', 'path'],
      emotional_core: 'joy of finding what was missing'
    },
    passage: {
      name: 'Passage',
      description: 'Moving from one state to another, from darkness to light',
      symbols: ['path', 'door', 'bridge', 'lantern'],
      emotional_core: 'transformation and growth'
    },
    balance: {
      name: 'Balance',
      description: 'Light and dark in harmony, not conflict',
      symbols: ['yin_yang', 'equinox', 'half_moon', 'shadow'],
      emotional_core: 'harmony and equilibrium'
    }
  },

  // Cultural adaptation templates
  cultural_adaptations: {
    // East Asian adaptations
    east_asian: {
      regions: ['China', 'Japan', 'Korea', 'Taiwan', 'Singapore'],
      hook: 'The lantern is a symbol of hope, reunion, and the guidance of ancestors.',
      story_elements: ['ancestor guidance', 'family reunion', 'wish making'],
      visual_style: 'Elegant, minimal, nature-focused',
      character_tweaks: {
        wisp: "Wisp is a gentle spirit who guides the lost home.",
        drz: "Dr. Z is a eccentric inventor, not mad but passionate.",
        professor_hoot: "Professor Hoot is a wise elder, not just an owl."
      }
    },
    // South Asian adaptations
    south_asian: {
      regions: ['India', 'Sri Lanka', 'Nepal', 'Bangladesh', 'Pakistan'],
      hook: 'The festival of lights celebrates the victory of light over darkness, good over evil.',
      story_elements: ['victory celebration', 'lamp lighting', 'sweet sharing'],
      visual_style: 'Colorful, ornate, celebratory',
      character_tweaks: {
        wisp: "Wisp is a gentle flame spirit who brings blessings.",
        drz: "Dr. Z is a brilliant scientist with a heart of gold.",
        professor_hoot: "Professor Hoot is a wise sage in owl form."
      }
    },
    // Western adaptations
    western: {
      regions: ['USA', 'UK', 'Canada', 'Australia', 'Western Europe'],
      hook: 'On the longest night, when shadows are deepest, light is most precious.',
      story_elements: ['spooky atmosphere', 'costume fun', 'candy reward'],
      visual_style: 'Spooky, playful, seasonal',
      character_tweaks: {
        wisp: "Wisp is a mischievous trickster spirit.",
        drz: "Dr. Z is a mad scientist with a heart of gold.",
        professor_hoot: "Professor Hoot is a mysterious owl guardian."
      }
    },
    // Latin American adaptations
    latin_american: {
      regions: ['Mexico', 'Brazil', 'Argentina', 'Colombia', 'Peru'],
      hook: 'The lanterns guide the spirits home during the celebration of life and memory.',
      story_elements: ['spirit guidance', 'family remembrance', 'celebration'],
      visual_style: 'Vibrant, colorful, family-oriented',
      character_tweaks: {
        wisp: "Wisp is a playful spirit who loves celebrations.",
        drz: "Dr. Z is a passionate inventor with big dreams.",
        professor_hoot: "Professor Hoot is a wise family elder."
      }
    },
    // Middle Eastern adaptations
    middle_eastern: {
      regions: ['Turkey', 'Iran', 'UAE', 'Saudi Arabia', 'Egypt'],
      hook: 'The lantern is a symbol of guidance, hope, and the light of knowledge.',
      story_elements: ['guidance seeking', 'wisdom pursuit', 'light of knowledge'],
      visual_style: 'Geometric, ornate, mysterious',
      character_tweaks: {
        wisp: "Wisp is a guiding light for the lost.",
        drz: "Dr. Z is a brilliant scholar with eccentric habits.",
        professor_hoot: "Professor Hoot is a keeper of ancient wisdom."
      }
    },
    // African adaptations
    african: {
      regions: ['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Ethiopia'],
      hook: 'The lantern carries the wisdom of ancestors and the light of community.',
      story_elements: ['ancestor wisdom', 'community gathering', 'light of unity'],
      visual_style: 'Bold, patterned, community-focused',
      character_tweaks: {
        wisp: "Wisp is an ancestral spirit who guides the community.",
        drz: "Dr. Z is a brilliant innovator for the community.",
        professor_hoot: "Professor Hoot is the village elder in spirit form."
      }
    }
  },

  // Transition narratives between stops
  transitions: {
    halloween: [
      "Wisp's light is a candle cupped in small hands. The night is big, and she is small — for now. Keepers, the road home starts at the pumpkin.",
      "One lantern lit. Wisp stands a little taller, and the dark gives back a step.",
      "Two lights. Somewhere behind her eyes, a road she used to know is coming back to her.",
      "Three — half the parade. Wisp is humming a tune she could not have named an hour ago.",
      "Four lanterns, and the tune has words now — the parade tune, the one she danced through the spider's crossing. She almost remembers the way home.",
      "Five. One more light, and the road home exists again. Almost there, Keepers."
    ],
    lantern_festival: [
      "The wind carries the scent of incense and the promise of another lantern...",
      "A distant glow beckons — another wish waiting to be fulfilled...",
      "The path winds on, lined with the hopes of those who came before...",
      "Wisp dances ahead, her light joining with the stars above...",
      "The festival grows brighter with each lantern you find...",
      "One more, and the sky will be full of light..."
    ],
    summer_solstice: [
      "The sun hangs low, its light fading — but another lantern awaits...",
      "The longest day is not over yet. The next lantern calls...",
      "Shadows stretch across the grass, but the lanterns push them back...",
      "Wisp soars higher, chasing the last rays of the solstice sun...",
      "The light is almost complete. One more lantern...",
      "The sun meets the lanterns, and the day is saved..."
    ],
    spring_equinox: [
      "Light and dark stand equal — but the next lantern will tip the balance...",
      "A breeze stirs the new leaves, carrying the scent of the next lantern...",
      "The equilibrium holds, but barely. Find the next light...",
      "Wisp flutters between shadow and light, guiding you onward...",
      "The balance is almost restored. One more lantern...",
      "Light and dark in harmony — the way it should be..."
    ],
    diwali: [
      "The lamps flicker in the wind, but another flame awaits...",
      "The night is dark, but the lanterns are many. Onward...",
      "Wisp dances between the lamps, her light joining theirs...",
      "The victory of light is near. One more lamp...",
      "The shadows retreat with each lantern you find...",
      "Light conquers all — and you are the bearers of that light..."
    ],
    mid_autumn: [
      "The full moon watches overhead as you seek the next lantern...",
      "The night is clear and bright, but the lanterns are still scattered...",
      "Wisp dances in the moonbeams, guiding you to the next light...",
      "The reunion is almost complete. One more lantern...",
      "The moon and lanterns shine together, a circle of light...",
      "The full moon, the lanterns, and the family — all together at last..."
    ]
  },

  // Initialize the global story engine
  init() {
    this.currentMode = this.detectMode();
    this.currentCulture = this.detectCulture();
    this.applyCulturalAdaptation();
    this.renderStoryElements();
    return this;
  },

  // Detect the best story mode based on date/location
  detectMode() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Halloween: October
    if (month === 10) return 'halloween';
    
    // Lantern Festival: 15th day of first lunar month (approx late Jan/Feb)
    if (month === 1 || month === 2) return 'lantern_festival';
    
    // Summer Solstice: June 20-22
    if (month === 6 && day >= 20) return 'summer_solstice';
    
    // Spring Equinox: March 20-22
    if (month === 3 && day >= 20) return 'spring_equinox';
    
    // Diwali: Oct/Nov (approx)
    if ((month === 10 && day > 15) || (month === 11 && day < 15)) return 'diwali';
    
    // Mid-Autumn: Sep/Oct (approx)
    if ((month === 9 && day > 15) || (month === 10 && day < 15)) return 'mid_autumn';
    
    // Default: pick a random mode for variety
    const modes = Object.keys(this.modes);
    return modes[Math.floor(Math.random() * modes.length)];
  },

  // Detect culture based on browser language/geolocation
  detectCulture() {
    const lang = (navigator.language || 'en').split('-')[0].toLowerCase();
    const region = (navigator.language || 'en').split('-')[1] || 'US';
    
    // Map language/region to culture
    const cultureMap = {
      'zh': 'east_asian',
      'ja': 'east_asian',
      'ko': 'east_asian',
      'hi': 'south_asian',
      'ta': 'south_asian',
      'te': 'south_asian',
      'bn': 'south_asian',
      'gu': 'south_asian',
      'mr': 'south_asian',
      'en': 'western',
      'es': 'latin_american',
      'pt': 'latin_american',
      'fr': 'western',
      'de': 'western',
      'ar': 'middle_eastern',
      'fa': 'middle_eastern',
      'he': 'middle_eastern',
      'sw': 'african',
      'zu': 'african',
      'am': 'african',
      'yo': 'african'
    };
    
    return cultureMap[lang] || 'western';
  },

  // Apply cultural adaptation to the current story mode
  applyCulturalAdaptation() {
    const mode = this.modes[this.currentMode] || this.modes.halloween;
    const culture = this.cultural_adaptations[this.currentCulture] || this.cultural_adaptations.western;
    
    // Store adapted story elements
    this.adaptedStory = {
      mode: mode,
      culture: culture,
      intro: this.localizeText(mode.intro, culture),
      outro: this.localizeText(mode.outro, culture),
      transitions: this.transitions[mode.id] || this.transitions.halloween
    };
  },

  // Localize text based on culture
  localizeText(text, culture) {
    // In a real implementation, this would use proper i18n
    // For now, we apply cultural hooks
    let localized = text;
    
    // Add cultural flavor based on region
    if (culture.regions) {
      const region = culture.regions[0];
      // This is where you'd add region-specific flavor text
      // For now, we keep it simple
    }
    
    return localized;
  },

  // Render story elements to the DOM
  renderStoryElements() {
    // Add story intro to the start screen
    const startScreen = document.getElementById('screen-start');
    if (startScreen) {
      let intro = startScreen.querySelector('.story-intro');
      if (!intro) {
        intro = document.createElement('p');
        intro.className = 'story-intro';
        startScreen.insertBefore(intro, startScreen.firstChild);
      }
      const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
      const storyContent = pack.story_content || {};
      const content = storyContent[lang] || storyContent['en'] || {};
      intro.textContent = content.intro || this.adaptedStory?.intro || this.modes.halloween.intro;
    }

    // Add story outro to the finale screen
    const finaleScreen = document.getElementById('screen-finale');
    if (finaleScreen) {
      let outro = finaleScreen.querySelector('.story-outro');
      if (!outro) {
        outro = document.createElement('p');
        outro.className = 'story-outro';
        finaleScreen.insertBefore(outro, finaleScreen.firstChild);
      }
      const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
      const storyContent = pack.story_content || {};
      const content = storyContent[lang] || storyContent['en'] || {};
      outro.textContent = content.outro || this.adaptedStory?.outro || this.modes.halloween.outro;
    }

    // Add environmental storytelling
    this.renderEnvironmentalStory();
  },

  // Render environmental storytelling based on current stop
  renderEnvironmentalStory() {
    const env = pack.environmental_storytelling || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    const envContent = env[lang] || env['en'] || {};
    
    // Add environment description to map screen
    const mapScreen = document.getElementById('screen-map');
    if (mapScreen && !mapScreen.querySelector('.env-story')) {
      const envEl = document.createElement('p');
      envEl.className = 'env-story story-transition';
      const next = nextUnsolved();
      if (next) {
        const envKey = this.getEnvironmentKey(next.id);
        envEl.textContent = envContent[envKey] || '';
      }
      if (envEl.textContent) {
        mapScreen.insertBefore(envEl, mapScreen.firstChild);
      }
    }
  },

  // Get environment key for a stop
  getEnvironmentKey(stopId) {
    const keys = { 1: 'park', 2: 'park', 3: 'graveyard', 4: 'gazebo', 5: 'park', 6: 'parade_ground' };
    return keys[stopId] || 'park';
  },

  // Get dynamic story element based on game state
  getDynamicStoryElement(type) {
    const dynamic = pack.dynamic_story || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    
    if (type === 'weather') {
      // In a real implementation, this would use a weather API
      return dynamic.weather_effects?.[lang]?.clear || '';
    }
    if (type === 'time') {
      const hour = new Date().getHours();
      let timeKey = 'night';
      if (hour >= 5 && hour < 12) timeKey = 'dawn';
      else if (hour >= 12 && hour < 17) timeKey = 'day';
      else if (hour >= 17 && hour < 20) timeKey = 'dusk';
      return dynamic.time_of_day?.[lang]?.[timeKey] || '';
    }
    if (type === 'progress') {
      const solved = state.solved.length;
      let progressKey = 'start';
      if (solved >= 1) progressKey = 'quarter';
      if (solved >= 3) progressKey = 'halfway';
      if (solved >= 5) progressKey = 'almost';
      if (solved >= 6) progressKey = 'complete';
      return dynamic.player_progress?.[lang]?.[progressKey] || '';
    }
    return '';
  },

  // Get story choice for a stop
  getStoryChoice(stopId) {
    const choices = pack.story_choices || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    const langChoices = choices[lang] || choices['en'] || [];
    return langChoices.find(c => c.stop === stopId) || null;
  },

  // Get character arc for current progress
  getCharacterArc(character) {
    const arcs = pack.character_arcs || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    const charArcs = arcs[character]?.[lang] || arcs[character]?.['en'] || {};
    const solved = state.solved.length;
    if (solved < 2) return charArcs.start || '';
    if (solved < 4) return charArcs.middle || '';
    return charArcs.end || '';
  },

  // Get theme description
  getThemeDescription(themeId) {
    const themes = pack.themes || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    return themes[themeId]?.[lang] || themes[themeId]?.['en'] || '';
  },

  // Get cultural adaptation text
  getCulturalAdaptation(cultureId) {
    const adaptations = pack.cultural_adaptations || {};
    const lang = (typeof I18n !== 'undefined') ? I18n.current : 'en';
    return adaptations[cultureId]?.[lang] || adaptations[cultureId]?.['en'] || '';
  },

  // Get the current story mode
  getCurrentMode() {
    return this.currentMode || 'halloween';
  },

  // Get the current culture
  getCurrentCulture() {
    return this.currentCulture || 'western';
  },

  // Get transition text for between stops
  getTransition(stopIndex) {
    const transitions = this.adaptedStory?.transitions || this.transitions.halloween;
    return transitions[stopIndex % transitions.length];
  },

  // Get character dialogue
  getCharacterDialogue(character, emotion) {
    const char = this.characters[character];
    if (!char) return '';
    return char.emotions[emotion] || '';
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GlobalStory.init());
} else {
  GlobalStory.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlobalStory;
}
