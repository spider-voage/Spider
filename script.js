const TMDB_API_KEY = '00abfeff5aca77b5e8ab34f08bd95109';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const INTERNET_ARCHIVE_API = 'https://archive.org/advancedsearch.php';
const IMAGE_PROXY = 'https://images.weserv.nl/?url=';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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
    }
});

// Load public domain movies on page load
window.addEventListener('load', () => {
    loadPublicDomainMovies();
});

async function loadPublicDomainMovies() {
    try {
        const query = 'collection:community_texts AND mediatype:movies';
        const response = await fetch(
            `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(query)}&fl=identifier,title,description,publicdate&output=json&rows=30`
        );
        const data = await response.json();
        publicDomainMovies = data.response.docs || [];
        displayMovies(publicDomainMovies);
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error loading movies. Please try again.</p>';
    }
}

async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const searchQuery = `${query} AND collection:community_texts AND mediatype:movies`;
        const response = await fetch(
            `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(searchQuery)}&fl=identifier,title,description,publicdate&output=json&rows=30`
        );
        const data = await response.json();
        displayMovies(data.response.docs || []);
    } catch (error) {
        console.error('Error searching movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error searching movies. Please try again.</p>';
    }
}

function getProxiedImageUrl(url) {
    if (!url) return null;
    return `${IMAGE_PROXY}${encodeURIComponent(url)}&w=500&h=750&fit=cover`;
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';

    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">No movies found. Try searching for something else!</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        const title = movie.title || 'Unknown Title';
        const year = movie.publicdate ? new Date(movie.publicdate).getFullYear() : 'N/A';
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
    const year = movie.publicdate ? new Date(movie.publicdate).getFullYear() : 'N/A';
    const description = movie.description || 'No description available.';

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
    
    try {
        // Fetch movie metadata from Internet Archive
        const response = await fetch(`https://archive.org/metadata/${identifier}`);
        const data = await response.json();
        
        // Find video file
        const files = data.files || {};
        let videoFile = null;
        
        for (const [filename, file] of Object.entries(files)) {
            if (filename.match(/\.(mp4|webm|ogv)$/i) && file.format && file.format.includes('Video')) {
                videoFile = file;
                break;
            }
        }
        
        if (videoFile) {
            const videoUrl = `https://archive.org/download/${identifier}/${Object.keys(files).find(k => files[k] === videoFile)}`;
            videoSource.src = videoUrl;
            playerTitle.textContent = currentMovie.title || 'Now Playing';
            playerDescription.textContent = (currentMovie.description || '').substring(0, 300);
            
            moviePlayer.load();
            moviePlayer.play();
            
            // Scroll to player
            document.querySelector('.watch-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Video file not found. This title may not have a playable version.');
        }
    } catch (error) {
        console.error('Error playing movie:', error);
        alert('Error loading video. Please try another movie.');
    }
}

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Navigation smooth scroll
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
    });
});
