import os

p = r'c:\CODE\GITHUB\Scanora-V1\frontend\src\pages\Inventory.jsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

reps = [
    (
        '<div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">',
        '<div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700">'
    ),
    (
        '<h3 className="text-lg font-bold text-gray-800 mb-2">',
        '<h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">'
    ),
    (
        '<p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">',
        '<p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">'
    ),
    (
        'className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"',
        'className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"'
    ),
    (
        '<h3 className="font-semibold text-gray-900 capitalize">{getFruitLabel(item.fruit_type)}</h3>',
        '<h3 className="font-semibold text-gray-900 dark:text-white capitalize">{getFruitLabel(item.fruit_type)}</h3>'
    ),
    (
        'className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all animate-slide-up flex flex-col overflow-hidden relative"',
        'className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl transform transition-all animate-slide-up flex flex-col overflow-hidden relative"'
    ),
    (
        'bg-white border-b border-gray-100',
        'bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700'
    ),
    (
        '<span className="text-[18px] font-bold text-gray-900 capitalize leading-none">',
        '<span className="text-[18px] font-bold text-gray-900 dark:text-white capitalize leading-none">'
    ),
    (
        'className="w-[80%] min-h-[44px] bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"',
        'className="w-[80%] min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"'
    ),
    (
        '<p className="text-sm text-gray-500 font-medium whitespace-nowrap">Update Freshness Score:</p>',
        '<p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Update Freshness Score:</p>'
    ),
    (
        '<p className="text-gray-500 dark:text-gray-300 font-medium text-sm flex items-center gap-2">',
        '<p className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-2">'
    ),
    (
        '<h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize leading-none">',
        '<h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize leading-none">'
    )
]

for old, new in reps:
    c = c.replace(old, new)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patching Inventory.jsx done.")
