import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Default translations inline as a fallback (en)
const resources = {
  en: {
    translation: {
      app: {
        name: 'Damio Kids',
        adminPanel: 'Admin Panel'
      },
      nav: {
        analytics: 'Analytics',
        addProduct: 'Add Product',
        productList: 'Product List',
        inventory: 'Inventory',
        orders: 'Orders',
        delivery: 'Delivery',
        categories: 'Categories',
        shopImages: 'Shop Images',
        collections: 'Collections',
        emailNotifications: 'Email Notifications',
        settings: 'Settings',
        mainMenu: 'MAIN MENU',
        dashboardSection: 'DASHBOARD',
        productsSection: 'PRODUCTS',
        ordersSection: 'ORDERS',
        contentSection: 'CONTENT',
        communicationSection: 'COMMUNICATION',
        settingsSection: 'SETTINGS',
        expandSidebar: 'Expand sidebar',
        collapseSidebar: 'Collapse sidebar',
        closeSidebar: 'Close sidebar'
      },
      auth: {
        welcomeBack: 'Welcome Back',
        signInToAdmin: 'Sign in to your admin account',
        emailAddress: 'Email Address',
        password: 'Password',
        enterEmail: 'Enter your email',
        enterPassword: 'Enter your password',
        signIn: 'Sign In',
        signingIn: 'Signing in...',
        forgotPasswordHint: 'Forgot your password? Contact the system administrator.'
      },
      addProduct: {
        title: 'Add New Product',
        tabs: {
          basic: 'Basic Info',
          variants: 'Variants',
          details: 'Details',
          seo: 'SEO & Status',
          flags: 'Homepage Flags'
        },
        productName: 'Product Name',
        description: 'Product Description',
        category: 'Category',
        subcategory: 'Subcategory',
        availableSizes: 'Available Sizes',
        availableColors: 'Available Colors',
        addCustomSize: '+ Add Custom Size',
        shoeSize: 'Shoe Size / Pointure',
        add: 'Add',
        cancel: 'Cancel',
        save: 'Add Product'
      }
    }
  },
  fr: {
    translation: {
      app: {
        name: 'Damio Kids',
        adminPanel: "Panneau d'administration"
      },
      nav: {
        analytics: 'Analytique',
        addProduct: 'Ajouter un produit',
        productList: 'Liste des produits',
        inventory: 'Inventaire',
        orders: 'Commandes',
        delivery: 'Livraison',
        categories: 'Catégories',
        shopImages: 'Images du magasin',
        collections: 'Collections',
        emailNotifications: 'Notifications par e-mail',
        settings: 'Paramètres',
        mainMenu: 'MENU PRINCIPAL',
        dashboardSection: 'TABLEAU DE BORD',
        productsSection: 'PRODUITS',
        ordersSection: 'COMMANDES',
        contentSection: 'CONTENU',
        communicationSection: 'COMMUNICATION',
        settingsSection: 'PARAMÈTRES',
        expandSidebar: 'Développer la barre latérale',
        collapseSidebar: 'Réduire la barre latérale',
        closeSidebar: 'Fermer la barre latérale'
      },
      auth: {
        welcomeBack: 'Bon retour',
        signInToAdmin: "Connectez-vous à votre compte administrateur",
        emailAddress: 'Adresse e-mail',
        password: 'Mot de passe',
        enterEmail: 'Entrez votre e-mail',
        enterPassword: 'Entrez votre mot de passe',
        signIn: 'Se connecter',
        signingIn: 'Connexion...',
        forgotPasswordHint: "Mot de passe oublié ? Contactez l'administrateur du système."
      },
      addProduct: {
        title: 'Ajouter un nouveau produit',
        tabs: {
          basic: 'Informations de base',
          variants: 'Variantes',
          details: 'Détails',
          seo: 'SEO et statut',
          flags: 'Éléments de la page d\'accueil'
        },
        productName: 'Nom du produit',
        description: 'Description du produit',
        category: 'Catégorie',
        subcategory: 'Sous-catégorie',
        availableSizes: 'Tailles disponibles',
        availableColors: 'Couleurs disponibles',
        addCustomSize: '+ Ajouter une taille personnalisée',
        shoeSize: 'Pointure / Taille de chaussure',
        add: 'Ajouter',
        cancel: 'Annuler',
        save: 'Ajouter le produit'
      }
    }
  },
  ar: {
    translation: {
      app: {
        name: 'داميو كيدز',
        adminPanel: 'لوحة الإدارة'
      },
      nav: {
        analytics: 'الإحصائيات',
        addProduct: 'إضافة منتج',
        productList: 'قائمة المنتجات',
        inventory: 'المخزون',
        orders: 'الطلبات',
        delivery: 'التوصيل',
        categories: 'الفئات',
        shopImages: 'صور المتجر',
        collections: 'التشكيلات',
        emailNotifications: 'تنبيهات البريد الإلكتروني',
        settings: 'الإعدادات',
        mainMenu: 'القائمة الرئيسية',
        dashboardSection: 'لوحة التحكم',
        productsSection: 'المنتجات',
        ordersSection: 'الطلبات',
        contentSection: 'المحتوى',
        communicationSection: 'التواصل',
        settingsSection: 'الإعدادات',
        expandSidebar: 'توسيع الشريط الجانبي',
        collapseSidebar: 'طي الشريط الجانبي',
        closeSidebar: 'إغلاق الشريط الجانبي'
      },
      auth: {
        welcomeBack: 'مرحبًا بعودتك',
        signInToAdmin: 'سجل الدخول إلى حساب الإدارة',
        emailAddress: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        enterEmail: 'أدخل بريدك الإلكتروني',
        enterPassword: 'أدخل كلمة المرور',
        signIn: 'تسجيل الدخول',
        signingIn: 'جاري تسجيل الدخول...',
        forgotPasswordHint: 'هل نسيت كلمة المرور؟ اتصل بمسؤول النظام.'
      },
      addProduct: {
        title: 'إضافة منتج جديد',
        tabs: {
          basic: 'معلومات أساسية',
          variants: 'الخيارات',
          details: 'التفاصيل',
          seo: 'السيو والحالة',
          flags: 'أقسام الصفحة الرئيسية'
        },
        productName: 'اسم المنتج',
        description: 'وصف المنتج',
        category: 'الفئة',
        subcategory: 'الفئة الفرعية',
        availableSizes: 'المقاسات المتاحة',
        availableColors: 'الألوان المتاحة',
        addCustomSize: '+ إضافة مقاس مخصص',
        shoeSize: 'مقاس الحذاء / Pointure',
        add: 'إضافة',
        cancel: 'إلغاء',
        save: 'إضافة المنتج'
      }
    }
  }
};

const savedLng = (() => {
  try { return localStorage.getItem('lang'); } catch { return null; }
})();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// Handle direction and persist language
try {
  const initialLng = i18n.language || savedLng || 'en';
  document.documentElement.dir = initialLng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLng;
} catch {}

i18n.on('languageChanged', (lng) => {
  try {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    localStorage.setItem('lang', lng);
  } catch {}
});

export default i18n;
