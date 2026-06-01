
if os.path.exists(os.path.join(src_dir, 'pages', 'ImpactStats.jsx')):
    # Rename it first
    pass #os.path.join(src_dir, 'pages', 'ImpactStats.jsx'), os.path.join(src_dir, 'pages', 'Statistic.jsx'))

replace_in_file(os.path.join(src_dir, 'pages', 'Statistic.jsx'), [
    ('export default function ImpactStats()', 'export default function Statistic()'),
    ('bg-gray-50 flex flex-col', 'bg-gray-50 dark:bg-gray-900 flex flex-col'),
    ('bg-gray-50 pb-20 relative flex flex-col', 'bg-gray-50 dark:bg-gray-900 pb-20 relative flex flex-col'),
    ('bg-gray-50 pb-20 transition-colors relative', 'bg-gray-50 dark:bg-gray-900 pb-20 transition-colors relative'),
    ('text-gray-900', 'text-gray-900 dark:text-white'),
    ('bg-white px-6 pt-6', 'bg-white dark:bg-gray-800 px-6 pt-6'),
    ('border-gray-100', 'border-gray-100 dark:border-gray-700'),
    ('text-gray-500 hover:text-gray-900', 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'),
    ('bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700', 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300'),
    ('text-gray-500 font-bold p-6 text-center', 'text-gray-500 dark:text-gray-300 font-bold p-6 text-center'),
    ('bg-white text-gray-700 hover:text-gray-900', 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'),
    ('bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col hover:bg-gray-50', 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col hover:bg-gray-50 dark:hover:bg-gray-700'),
    ('bg-white border border-gray-100 rounded-2xl', 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl'),
    ('text-gray-800 hover:bg-gray-50', 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'),
    ('text-gray-800', 'text-gray-800 dark:text-white'),
    ('text-gray-600', 'text-gray-600 dark:text-gray-300'),
    ('text-gray-500', 'text-gray-500 dark:text-gray-400'),
])

