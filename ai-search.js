const AI_SEARCH = {
  // Clé Gemini (à remplir par l'admin dans les paramètres)
  GEMINI_API_KEY: "",
  
  // Stockage local de la clé
  loadApiKey() {
    const key = localStorage.getItem('GEMINI_API_KEY');
    if (key) this.GEMINI_API_KEY = key;
  },

  saveApiKey(key) {
    this.GEMINI_API_KEY = key;
    localStorage.setItem('GEMINI_API_KEY', key);
  },

  // Recherche locale intelligente (gratuite, sans API)
  async localSearch(query) {
    const results = {
      vehicles: [],
      dtcCodes: [],
      recalls: []
    };

    const q = query.toLowerCase().trim();

    // Recherche véhicules
    results.vehicles = await VEHICLES_DB.search(q);

    // Recherche DTC
    results.dtcCodes = await DTC_DB.search(q);

    // Recherche par marque/mot-clé dans rappels
    const allRecalls = await DB.getAll('recalls');
    results.recalls = allRecalls.filter(r =>
      r.brand.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );

    return results;
  },

  // Recherche Gemini (spécifique APK)
  async geminiSearch(query) {
    if (!this.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Clé API Gemini non configurée. Allez dans Espace Admin > Paramètres."
      };
    }

    try {
      const prompt = `Tu es un expert en diagnostic automobile. Réponds en français, de façon claire et structurée.
      
Question: ${query}

Réponds avec:
1. Diagnostic probable
2. Codes DTC potentiellement associés (P0xxx, C0xxx, B0xxx, U0xxx)
3. Pièces à vérifier
4. Niveau de dangerosité (Faible/Moyen/Élevé)
5. Réparations recommandées`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return { success: false, error: err.error?.message || 'Erreur API Gemini' };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune réponse.";

      return {
        success: true,
        response: text,
        source: "Gemini AI",
        timestamp: Date.now()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Recherche IA gratuite alternative (Hugging Face Inference - gratuite)
  async freeAISearch(query) {
    try {
      // Utilisation d'un modèle gratuit via Hugging Face
      const response = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: `Expert diagnostic automobile. Question: ${query}. Réponse en français:`,
            parameters: { max_new_tokens: 500 }
          })
        }
      );

      if (!response.ok) {
        return { success: false, error: 'Service IA gratuit indisponible. Utilisez Gemini.' };
      }

      const data = await response.json();
      return {
        success: true,
        response: data[0]?.generated_text || "Aucune réponse.",
        source: "Mistral AI (gratuit)",
        timestamp: Date.now()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Recherche combinée : local + IA
  async combinedSearch(query) {
    const local = await this.localSearch(query);
    
    // Si on a des résultats locaux suffisants, pas besoin d'IA
    if (local.dtcCodes.length > 0 || local.recalls.length > 0) {
      return {
        type: 'local',
        results: local
      };
    }

    // Sinon, essayer Gemini d'abord
    if (this.GEMINI_API_KEY) {
      const gemini = await this.geminiSearch(query);
      if (gemini.success) {
        return { type: 'gemini', ...gemini };
      }
    }

    // Fallback IA gratuite
    const free = await this.freeAISearch(query);
    if (free.success) {
      return { type: 'free_ai', ...free };
    }

    return {
      type: 'none',
      message: "Aucun résultat trouvé. Essayez une recherche plus précise (code DTC, marque, modèle)."
    };
  }
};

// Chargement au démarrage
AI_SEARCH.loadApiKey();
