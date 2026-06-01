import os

def process_profile(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'useTranslation' not in content:
        content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';")
        content = content.replace("export default function Profile() {", "export default function Profile() {\n  const { t, i18n } = useTranslation();")
        
        # Replace language toggle logic
        content = content.replace("const [language, setLanguage] = useState('id');", "")
        content = content.replace("const toggleLanguage = () => {", "const toggleLanguage = () => {\n    const newLang = i18n.language === 'id' ? 'en' : 'id';\n    i18n.changeLanguage(newLang);")
        content = content.replace("setLanguage(language === 'id' ? 'en' : 'id');", "")
        
        # Replace some texts
        content = content.replace("Pengaturan & Profil", "{t('profile.title')}")
        content = content.replace("Pengaturan Aplikasi", "{t('profile.appSettings')}")
        content = content.replace("Bahasa", "{t('profile.language')}")
        content = content.replace("Mode Gelap", "{t('profile.darkMode')}")
        content = content.replace("Aksi Akun", "{t('profile.accountActions')}")
        content = content.replace("Keluar", "{t('profile.signOut')}")
        content = content.replace("Versi Aplikasi", "{t('profile.version')}")
        content = content.replace("Dibuat dengan ❤️ oleh Tim Scanora", "{t('profile.madeWith')}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def process_sidenav(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'useTranslation' not in content:
        content = content.replace("import { useNavigate, useLocation } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';")
        content = content.replace("export default function SideNav() {", "export default function SideNav() {\n  const { t } = useTranslation();")
        
        # Replace nav items array map labels
        content = content.replace("label: 'Beranda'", "label: t('nav.home')")
        content = content.replace("label: 'Inventori'", "label: t('nav.inventory')")
        content = content.replace("label: 'Riwayat'", "label: t('nav.history')")
        content = content.replace("label: 'Statistik'", "label: t('nav.stats')")
        content = content.replace("label: 'Profil'", "label: t('nav.profile')")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

src_dir = r"c:\CODE\GITHUB\Scanora-V1\frontend\src"
process_profile(os.path.join(src_dir, 'pages', 'Profile.jsx'))
process_sidenav(os.path.join(src_dir, 'components', 'SideNav.jsx'))
print("i18n applied to Profile and SideNav.")
