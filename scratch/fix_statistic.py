import re

with open('frontend/src/pages/Statistic.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { ChevronLeft", "import { useTranslation } from 'react-i18next';\nimport { ChevronLeft")
content = content.replace("name: 'Jan'", "name: '01'").replace("name: 'Feb'", "name: '02'").replace("name: 'Mar'", "name: '03'").replace("name: 'Apr'", "name: '04'").replace("name: 'Mei'", "name: '05'")
content = content.replace("color: '#fdc107'", "color: '#eab308'").replace("color: '#bb0006'", "color: '#ef4444'").replace("color: '#f87305'", "color: '#f97316'")

# Inject the formatter and useTranslation
hook_code = """  const { viewport } = useViewport();
  const isDesktop = viewport === 'desktop';
  const { t, i18n } = useTranslation();

  const formatMonthYear = (monthStr, yearNum) => {
    if (!monthStr || monthStr.length > 2) return `${monthStr} ${yearNum}`;
    const d = new Date(yearNum, parseInt(monthStr) - 1, 1);
    return new Intl.DateTimeFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }).format(d);
  };
  
  const formatMonth = (monthStr) => {
    if (!monthStr || monthStr.length > 2) return monthStr;
    const d = new Date(2000, parseInt(monthStr) - 1, 1);
    return new Intl.DateTimeFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', { month: 'short' }).format(d);
  };"""
content = content.replace("  const { viewport } = useViewport();\n  const isDesktop = viewport === 'desktop';", hook_code)

# Replace {current.name} {current.year} -> {formatMonthYear(current.name, current.year)}
content = content.replace("{current.name} {current.year}", "{formatMonthYear(current.name, current.year)}")

# Replace monthlyData[bestMonthIdx].name -> formatMonthYear(monthlyData[bestMonthIdx].name, monthlyData[bestMonthIdx].year)
# Wait, it's <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{monthlyData[bestMonthIdx].name}</p>
content = content.replace("{monthlyData[bestMonthIdx].name}", "{formatMonthYear(monthlyData[bestMonthIdx].name, monthlyData[bestMonthIdx].year)}")

# Replace m.name in the toggle bar bottom
content = content.replace("{m.name}", "{formatMonth(m.name)}")

# Vertical align cell fix: flex-col justify-center is there, but h-full is needed for cell
# <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
content = content.replace('p-4 shadow-sm flex flex-col justify-center"', 'p-4 shadow-sm flex flex-col justify-center h-full"')
content = content.replace('p-4 shadow-sm flex flex-col items-center justify-center"', 'p-4 shadow-sm flex flex-col items-center justify-center h-full"')

with open('frontend/src/pages/Statistic.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
