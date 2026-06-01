import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace slate- with gray-
    content = content.replace('slate-', 'gray-')

    # Specific fixes for Home.jsx
    if filepath.endswith('Home.jsx'):
        content = content.replace('className="text-gray-500 font-medium text-sm flex items-center gap-2"', 'className="text-gray-500 dark:text-gray-300 font-medium text-sm flex items-center gap-2"')
        content = content.replace('className="border-gray-200 mb-4"', 'className="border-gray-200 dark:border-gray-600 mb-4"')
        
    # Specific fixes for Statistic.jsx (formerly ImpactStats.jsx)
    if filepath.endswith('Statistic.jsx'):
        # Rename function
        content = content.replace('export default function ImpactStats()', 'export default function Statistic()')
        
        # Add dark mode classes for Statistic page
        content = content.replace('bg-gray-50', 'bg-gray-50 dark:bg-gray-900')
        content = content.replace('text-gray-900', 'text-gray-900 dark:text-white')
        content = content.replace('bg-white', 'bg-white dark:bg-gray-800')
        content = content.replace('border-gray-100', 'border-gray-100 dark:border-gray-700')
        content = content.replace('text-gray-700', 'text-gray-700 dark:text-gray-300')
        content = content.replace('text-gray-800', 'text-gray-800 dark:text-gray-200')
        content = content.replace('text-gray-500', 'text-gray-500 dark:text-gray-400')
        
        # specific to loading text and container
        content = content.replace('text-gray-500 font-bold', 'text-gray-500 dark:text-gray-300 font-bold')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

src_dir = r"c:\CODE\GITHUB\Scanora-V1\frontend\src"
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
