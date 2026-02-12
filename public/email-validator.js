/**
 * ChaosDuel - Email Validator
 * Bloque les emails jetables et temporaires avant l'envoi à Brevo
 * Version: 1.0.0
 */

const DISPOSABLE_DOMAINS = [
  // Top 100 domaines jetables les plus utilisés
  'yopmail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
  '10minutemail.com', 'throwaway.email', 'fakeinbox.com', 'maildrop.cc',
  'temp-mail.org', 'sharklasers.com', 'getairmail.com', 'guerrillamailblock.com',
  'pokemail.net', 'spam4.me', 'trashmail.com', 'dispostable.com',
  'tempr.email', 'mohmal.com', 'emailondeck.com', 'mytemp.email',
  'crazymailing.com', 'smashmail.de', 'mailnesia.com', 'anonbox.net',
  'dropmail.me', 'mintemail.com', 'mailcatch.com', 'getnada.com',
  'cs.email', 'spamgourmet.com', 'mailexpire.com', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'inboxkitten.com', 'emailfake.com', 'discard.email', 'trash-mail.com',
  'jetable.org', 'spambox.us', 'binkmail.com', 'safetymail.info',
  'anonymbox.com', 'bugmenot.com', 'deadaddress.com', 'despam.it',
  'discardmail.com', 'disposeamail.com', 'dodgit.com', 'e4ward.com',
  'filzmail.com', 'gishpuppy.com', 'great-host.in', 'hidemail.de',
  'incognitomail.org', 'jetable.fr.nf', 'kasmail.com', 'letthemeatspam.com',
  'lhsdv.com', 'lookugly.com', 'lopl.co.cc', 'lr78.com', 'maileater.com',
  'mailfreeonline.com', 'mailmetrash.com', 'mailmoat.com', 'mailnull.com',
  'mailshell.com', 'mailsiphon.com', 'mailzilla.com', 'mbx.cc',
  'mega.zik.dj', 'meltmail.com', 'messagebeamer.de', 'mierdamail.com',
  'mintemail.com', 'moburl.com', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'mt2009.com', 'mypartyclip.de', 'mytempemail.com', 'netmails.net',
  'nobulk.com', 'noclickemail.com', 'nospamfor.us', 'nowmymail.com',
  'objectmail.com', 'obobbo.com', 'oneoffemail.com', 'onewaymail.com',
  'pookmail.com', 'proxymail.eu', 'put2.net', 'receiveee.com'
];

/**
 * Vérifie si un email utilise un domaine jetable
 * @param {string} email - L'adresse email à vérifier
 * @returns {boolean} - true si l'email est jetable, false sinon
 */
function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];
  
  if (!domain) return false;
  
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Valide un email (format + domaine)
 * @param {string} email - L'adresse email à valider
 * @returns {Object} - { valid: boolean, error: string|null }
 */
function validateEmail(email) {
  // Validation format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Format d\'email invalide'
    };
  }
  
  // Validation domaine jetable
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      error: 'Les emails jetables ne sont pas autorisés. Utilise une adresse permanente.'
    };
  }
  
  return {
    valid: true,
    error: null
  };
}

/**
 * Intercepte la soumission du formulaire Brevo
 * et valide l'email avant l'envoi
 */
function initEmailValidator() {
  // Attendre que l'iframe Brevo soit chargée
  const iframe = document.querySelector('.form-iframe');
  
  if (!iframe) {
    console.warn('⚠️ Iframe Brevo non trouvée');
    return;
  }
  
  // Écouter les messages de l'iframe
  window.addEventListener('message', function(event) {
    // Vérifier que le message vient de Brevo
    if (!event.origin.includes('sibforms.com')) return;
    
    // Si c'est une soumission de formulaire
    if (event.data && event.data.type === 'formSubmit') {
      const email = event.data.email;
      
      const validation = validateEmail(email);
      
      if (!validation.valid) {
        // Bloquer la soumission
        event.preventDefault();
        
        // Afficher l'erreur
        showError(validation.error);
        
        // Logger l'événement
        console.log('❌ Email bloqué:', email, '→', validation.error);
        
        return false;
      }
      
      // Email valide, laisser passer
      console.log('✅ Email validé:', email);
    }
  });
  
  console.log('🔒 Validateur d\'emails initialisé');
}

/**
 * Affiche un message d'erreur à l'utilisateur
 * @param {string} message - Le message d'erreur
 */
function showError(message) {
  // Créer une notification toast
  const toast = document.createElement('div');
  toast.className = 'email-validator-error';
  toast.innerHTML = `
    <span class="error-icon">⚠️</span>
    <span class="error-text">${message}</span>
  `;
  
  // Styles inline pour être sûr qu'ils s'appliquent
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 0, 85, 0.95);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(255, 0, 85, 0.4);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  // Retirer après 5 secondes
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailValidator);
} else {
  initEmailValidator();
}

// Export pour utilisation externe si besoin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateEmail, isDisposableEmail, DISPOSABLE_DOMAINS };
}
