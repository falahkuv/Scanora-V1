import React from 'react';

const linkData = [
  // Media
  { 
    title: 'Presentasi Pitching Video', 
    url: 'https://youtu.be/nijPmIwR72k', 
    previewUrl: 'https://www.youtube.com/embed/nijPmIwR72k',
    category: 'Media', 
    icon: '⭐' 
  },
  { 
    title: 'User Guide & Demo Video', 
    url: 'https://www.youtube.com/watch?v=X7TOxLid65k', 
    previewUrl: 'https://www.youtube.com/embed/X7TOxLid65k',
    category: 'Media', 
    icon: '📺' 
  },
  
  // Live Demos
  { 
    title: 'Scanora-V1 (Demo App)', 
    url: 'https://scanora-v1.vercel.app/', 
    previewImage: '/logo-scanora-long.png',
    category: 'Live Demos', 
    icon: '🌐' 
  },
  { 
    title: 'Streamlit Data Analysis Dashboard', 
    url: 'https://scanora-dashboard-capstone-project.streamlit.app', 
    category: 'Live Demos', 
    icon: '📊' 
  },

  // Repositories
  { title: 'Web App Repository', url: 'https://github.com/falahkuv/Scanora-V1.git', category: 'Repositories', icon: '💻' },
  { title: 'Scanora AI Model', url: 'https://github.com/JayJung666/AI-Engineer_Scanora.git', category: 'Repositories', icon: '🧠' },
  { title: 'Data Feature Engineering & Analysis', url: 'https://github.com/ameliavega932-star/Scanora-DS.git', category: 'Repositories', icon: '📈' },

  // Documents & Presentations
  { title: 'Slide PPT Pitching', url: 'https://canva.link/ppt-scanora', category: 'Documents & Presentations', icon: '📑' },
  { title: 'Data Analysis Technical Report', url: 'https://drive.google.com/file/d/16-1i6hWtBR0GoSNxp5JQckJaljdEVBHE/view?usp=sharing', category: 'Documents & Presentations', icon: '📄' },

  // Data Resources
  { title: 'Dataset: Fruits Fresh and Rotten', url: 'https://www.kaggle.com/datasets/sriramr/fruits-fresh-and-rotten-for-classification', category: 'Data Resources', icon: '🍎' },
  { title: 'BPS: Rata-rata Konsumsi Buah', url: 'https://www.bps.go.id/id/statistics-table/2/MjU1OCMy/rata-rata-konsumsi-perkapita-seminggu-menurut-kelompok-buah-buahan-per-kabupaten-kota-komoditas-2025.html', category: 'Data Resources', icon: '📉' },
  {
    title: 'Shelf Life of Bananas',
    url: 'https://www.doesitgobad.com/banana-go-bad/',
    category: 'Data Resources',
    icon: '🍌'
  },
  {
    title: 'Shelf Life of Apples',
    url: 'https://www.vinmec.com/eng/blog/how-long-does-an-apple-last-en',
    category: 'Data Resources',
    icon: '🍏'
  },
  {
    title: 'Shelf Life of Oranges',
    url: 'https://discover.texasrealfood.com/does-it-go-bad/do-oranges-spoil',
    category: 'Data Resources',
    icon: '🍊'
  }
];

const categories = ['Media', 'Live Demos', 'Repositories', 'Documents & Presentations', 'Data Resources'];

const Dokumentasi = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      
      {/* Container - Max Width to look like Linktree */}
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Profile / Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img 
            src="/logo-scanora-square.png" 
            alt="Scanora-V1" 
            className="w-24 h-24 rounded-2xl shadow-lg mb-4 object-cover"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://ui-avatars.com/api/?name=Scanora+V1&background=0D8ABC&color=fff';
            }} 
          />
          <h1 className="text-2xl font-bold tracking-tight mb-1">Scanora-V1</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Documentation, Demos, Repositories, and Resources for the Scanora Capstone Project.
          </p>
        </div>

        {/* Links Container */}
        <div className="w-full flex flex-col gap-6">
          {categories.map((cat) => {
            const catLinks = linkData.filter((link) => link.category === cat);
            if (catLinks.length === 0) return null;

            return (
              <div key={cat} className="flex flex-col gap-4">
                {/* Category Divider */}
                <div className="flex items-center gap-3 mt-4 mb-2">
                  <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {cat}
                  </h2>
                  <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
                </div>

                {/* Links for this Category */}
                {catLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-green-500 dark:hover:border-emerald-500">
                    {/* Preview Iframe if available */}
                    {link.previewUrl && (
                      <div className="w-full aspect-video border-b border-gray-200 dark:border-gray-700 bg-black">
                        <iframe 
                          src={link.previewUrl} 
                          className="w-full h-full"
                          title={link.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    
                    {/* Preview Image if available */}
                    {link.previewImage && (
                      <div className="w-full aspect-video border-b border-gray-200 dark:border-gray-700 bg-white flex items-center justify-center p-4">
                        <img 
                          src={link.previewImage} 
                          alt={`${link.title} preview`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    
                    {/* Link Card Content */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center p-4 hover:bg-green-50 dark:hover:bg-gray-750 transition-colors duration-300 relative"
                    >
                      <span className="text-2xl mr-4 flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-sm font-semibold truncate group-hover:text-green-600 dark:group-hover:text-emerald-400 transition-colors">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap leading-relaxed">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600 pb-8">
          <p>© {new Date().getFullYear()} Scanora Capstone Team</p>
        </div>

      </div>
    </div>
  );
};

export default Dokumentasi;
