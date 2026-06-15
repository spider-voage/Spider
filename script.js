const TMDB_API_KEY = '00abfeff5aca77b5e8ab34f08bd95109';
const INTERNET_ARCHIVE_API = 'https://archive.org/advancedsearch.php';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const modal = document.getElementById('movieModal');
const closeBtn = document.querySelector('.close');
const moviePlayer = document.getElementById('moviePlayer');
const videoSource = document.getElementById('videoSource');
const playerTitle = document.getElementById('playerTitle');
const playerDescription = document.getElementById('playerDescription');
const backBtn = document.getElementById('backBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let currentMovie = null;
let publicDomainMovies = [];

// Search functionality
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});

// Player controls
backBtn.addEventListener('click', () => {
    document.querySelector('.watch-section').scrollIntoView({ behavior: 'smooth' });
    moviePlayer.pause();
});

fullscreenBtn.addEventListener('click', () => {
    if (moviePlayer.requestFullscreen) {
        moviePlayer.requestFullscreen();
    } else if (moviePlayer.webkitRequestFullscreen) {
        moviePlayer.webkitRequestFullscreen();
    }
});

// Load public domain movies on page load
window.addEventListener('load', () => {
    loadPublicDomainMovies();
});

async function loadPublicDomainMovies() {
    try {
        // Use the feature_films collection which has actual movie files
        const query = 'collection:feature_films AND (format:h.264 OR format:MPEG4) AND year:[1900 TO 1930]';
        const response = await fetch(
            `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(query)}&fl=identifier,title,description,year,publicdate&output=json&rows=40&sort=year+desc`
        );
        const data = await response.json();
        
        if (data.response && data.response.docs && data.response.docs.length > 0) {
            publicDomainMovies = data.response.docs;
            displayMovies(publicDomainMovies);
        } else {
            // Fallback query
            loadFallbackMovies();
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        loadFallbackMovies();
    }
}

async function loadFallbackMovies() {
    try {
        // Try a broader search
        const query = 'mediatype:movies AND (format:h.264 OR format:MPEG4 OR format:WebM)';
        const response = await fetch(
            `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(query)}&fl=identifier,title,description,year&output=json&rows=40`
        );
        const data = await response.json();
        publicDomainMovies = data.response.docs || [];
        displayMovies(publicDomainMovies);
    } catch (error) {
        console.error('Error loading fallback movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error loading movies. Please try searching manually.</p>';
    }
}

async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Searching...</p>';
        
        // Search across multiple collections
        const searchQuery = `(${query}) AND mediatype:movies AND (format:h.264 OR format:MPEG4 OR format:WebM OR format:"Ogg Video")`;
        const response = await fetch(
            `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(searchQuery)}&fl=identifier,title,description,year,publicdate&output=json&rows=40`
        );
        const data = await response.json();
        displayMovies(data.response.docs || []);
    } catch (error) {
        console.error('Error searching movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error searching. Please try again.</p>';
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';

    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem; grid-column: 1/-1;">No movies found. Try searching for another title!</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        const title = movie.title || 'Unknown Title';
        const year = movie.year || movie.publicdate ? new Date(movie.publicdate).getFullYear() : 'N/A';
        const placeholderGradient = 'linear-gradient(135deg, #0d47a1, #00838f)';

        movieCard.innerHTML = `
            <div class="movie-poster" style="background: ${placeholderGradient}; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 3rem;">🎬</span>
            </div>
            <div class="movie-info">
                <div class="movie-title">${title}</div>
                <div class="movie-rating">📺 Public Domain</div>
                <div class="movie-year">${year}</div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => showMovieDetails(movie));
        moviesGrid.appendChild(movieCard);
    });
}

function showMovieDetails(movie) {
    currentMovie = movie;
    const modalBody = document.getElementById('modalBody');
    const title = movie.title || 'Unknown Title';
    const year = movie.year || (movie.publicdate ? new Date(movie.publicdate).getFullYear() : 'N/A');
    const description = movie.description || 'Classic public domain film from Internet Archive.';

    const placeholderGradient = 'linear-gradient(135deg, #0d47a1, #00838f)';

    modalBody.innerHTML = `
        <div class="modal-detail">
            <div class="modal-poster" style="background: ${placeholderGradient};">
                <span style="font-size: 2rem;">🎬</span>
            </div>
            <div class="modal-info">
                <h2>${title}</h2>
                <p><strong>Year:</strong> ${year}</p>
                <p><strong>Source:</strong> Internet Archive</p>
                <p><strong>Description:</strong></p>
                <p>${description.substring(0, 200)}...</p>
                <button class="modal-watch-btn" onclick="playMovie('${movie.identifier}')">▶ Watch Now</button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

async function playMovie(identifier) {
    modal.style.display = 'none';
    playerTitle.textContent = 'Loading...';
    playerDescription.textContent = 'Please wait while we load the video...';
    
    try {
        // Fetch movie metadata from Internet Archive
        const response = await fetch(`https://archive.org/metadata/${identifier}`);
        if (!response.ok) throw new Error('Failed to fetch metadata');
        
        const data = await response.json();
        
        // Find video file
        const files = data.files || {};
        let videoFile = null;
        let videoFilename = null;
        
        // Look for h.264 first, then other formats
        const formats = ['h.264', 'MPEG4', 'WebM', 'Ogg Video', 'Theora'];
        
        for (const format of formats) {
            for (const [filename, file] of Object.entries(files)) {
                if (file.format === format && filename.match(/\\.(mp4|webm|ogv|mpeg)$/i)) {\n                    videoFile = file;
                    videoFilename = filename;
                    break;
                }
            }
            if (videoFile) break;
        }
        
        // If not found by format, search by extension
        if (!videoFile) {
            for (const [filename, file] of Object.entries(files)) {
                if (filename.match(/\\.(mp4|webm|ogv|mpeg)$/i)) {
                    videoFile = file;
                    videoFilename = filename;
                    break;
                }
            }
        }
        
        if (videoFile && videoFilename) {
            const videoUrl = `https://archive.org/download/${identifier}/${videoFilename}`;
            videoSource.src = videoUrl;
            playerTitle.textContent = currentMovie.title || 'Now Playing';
            playerDescription.textContent = (currentMovie.description || 'Enjoy this classic film!').substring(0, 300);
            
            moviePlayer.load();
            
            // Scroll to player
            document.querySelector('.watch-section').scrollIntoView({ behavior: 'smooth' });
            
            // Auto play after a short delay
            setTimeout(() => {
                moviePlayer.play().catch(e => console.log('Auto-play prevented:', e));
            }, 500);
        } else {
            throw new Error('No playable video format found');\n        }\n    } catch (error) {\n        console.error('Error playing movie:', error);\n        playerTitle.textContent = 'Error';\n        playerDescription.textContent = 'Sorry, this video cannot be played right now. Please try another movie.';\n        document.querySelector('.watch-section').scrollIntoView({ behavior: 'smooth' });\n    }\n}\n\ncloseBtn.addEventListener('click', () => {\n    modal.style.display = 'none';\n});\n\nwindow.addEventListener('click', (e) => {\n    if (e.target === modal) {\n        modal.style.display = 'none';\n    }\n});\n\n// Navigation smooth scroll\ndocument.querySelectorAll('.nav-link').forEach(link => {\n    link.addEventListener('click', (e) => {\n        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));\n        e.target.classList.add('active');\n    });\n});\n