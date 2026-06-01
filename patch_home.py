import os

p = r'c:\CODE\GITHUB\Scanora-V1\frontend\src\pages\Home.jsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

reps = [
    (
        '<div className="bg-gray-50 rounded-b-3xl p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">',
        '<div className="bg-gray-50 dark:bg-gray-800 rounded-b-3xl p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">'
    ),
    (
        '<div className="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 animate-pulse"></div>',
        '<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex-shrink-0 animate-pulse"></div>'
    ),
    (
        '<div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>',
        '<div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>'
    ),
    (
        '<div className="w-12 h-12 bg-gray-100 rounded-xl mb-3 animate-pulse" />',
        '<div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl mb-3 animate-pulse" />'
    ),
    (
        '<div className="h-8 bg-gray-100 rounded-lg w-16 mb-1 animate-pulse" />',
        '<div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-16 mb-1 animate-pulse" />'
    ),
    (
        '<div className="h-3 bg-gray-100 rounded-lg w-20 animate-pulse" />',
        '<div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-20 animate-pulse" />'
    ),
    (
        '<Bot size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />\n            <p className="text-[12px] text-gray-500 leading-relaxed">',
        '<Bot size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />\n            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">'
    ),
    (
        '<hr className="border-gray-200 dark:border-gray-600 mb-4" />',
        '<hr className="border-gray-200 dark:border-gray-700 mb-4" />'
    )
]

for old, new in reps:
    c = c.replace(old, new)

import re
# Clean up duplicated dark text classes from previous regex replace
c = re.sub(r'(dark:text-\w+-\d+ )+', r'\1', c)
c = re.sub(r'dark:text-white dark:text-white', 'dark:text-white', c)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patching Home.jsx done.")
