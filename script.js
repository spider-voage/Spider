const TMDB_API_KEY = '00abfeff5aca77b5e8ab34f08bd95109';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
// Use imgix as a reliable image proxy
const IMAGE_PROXY = 'https://images.weserv.nl/?url=';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const modal = document.getElementById('movieModal');
const closeBtn = document.querySelector('.close');

// Search functionality
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});

// Load popular movies on page load
window.addEventListener('load', () => {
    loadPopularMovies();
});

async function loadPopularMovies() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        displayMovies(data.results || []);
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error loading movies. Please check your API key.</p>';
    }
}

async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );
        const data = await response.json();
        displayMovies(data.results || []);
    } catch (error) {
        console.error('Error searching movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error searching movies. Please try again.</p>';
    }
}

function getProxiedImageUrl(posterPath) {
    if (!posterPath) return null;
    const imageUrl = `${IMAGE_BASE_URL}${posterPath}`;
    // Use the proxy to load images
    return `${IMAGE_PROXY}${encodeURIComponent(imageUrl)}&w=500&h=750&fit=cover`;
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
        
        const posterUrl = getProxiedImageUrl(movie.poster_path);
        const releaseYear = movie.release_date 
            ? new Date(movie.release_date).getFullYear()
            : 'N/A';

        const placeholderGradient = 'linear-gradient(135deg, #0d47a1, #00838f)';

        movieCard.innerHTML = `
            <div class="movie-poster" style="background: ${placeholderGradient}; display: flex; align-items: center; justify-content: center;">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="${movie.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`
                    : '<span style="font-size: 3rem;">🎬</span>'}
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.title || 'Unknown Title'}</div>
                <div class="movie-rating">⭐ ${movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 'N/A'}/5</div>
                <div class="movie-year">${releaseYear}</div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => showMovieDetails(movie));
        moviesGrid.appendChild(movieCard);
    });
}

function showMovieDetails(movie) {
    const modalBody = document.getElementById('modalBody');
    const posterUrl = getProxiedImageUrl(movie.poster_path);
    const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear()
        : 'N/A';

    const placeholderGradient = 'linear-gradient(135deg, #0d47a1, #00838f)';

    modalBody.innerHTML = `
        <div class="modal-detail">
            <div class="modal-poster" style="background: ${placeholderGradient}; display: flex; align-items: center; justify-content: center;">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`
                    : '<span style="font-size: 2rem;">🎬</span>'}
            </div>
            <div class="modal-info">
                <h2>${movie.title || 'Unknown Title'}</h2>
                <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <div class="modal-rating">⭐ Rating: ${movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 'N/A'}/5</div>
                <p><strong>Overview:</strong></p>
                <p>${movie.overview || 'No description available.'}</p>
                <p><strong>Popularity:</strong> ${movie.popularity ? movie.popularity.toFixed(0) : 'N/A'}</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
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
