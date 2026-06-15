const TMDB_API_KEY = '00abfeff5aca77b5e8ab34f08bd95109'; // Get free key from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
// CORS proxy to handle image loading
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

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
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
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
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        const data = await response.json();
        displayMovies(data.results || []);
    } catch (error) {
        console.error('Error searching movies:', error);
        moviesGrid.innerHTML = '<p style="color: #4dd0e1; text-align: center; padding: 2rem;">Error searching movies. Please try again.</p>';
    }
}

function getImageUrl(posterPath) {
    if (!posterPath) return null;
    // Try direct URL first
    return `${IMAGE_BASE_URL}${posterPath}`;
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
        
        const posterUrl = getImageUrl(movie.poster_path);
        const releaseYear = movie.release_date 
            ? new Date(movie.release_date).getFullYear()
            : 'N/A';

        const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%230d47a1;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2300838f;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22url(%23grad)%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%234dd0e1%22 font-size=%2236%22 font-family=%22Arial%22%3E🎬%3C/text%3E%3C/svg%3E';

        movieCard.innerHTML = `
            <div class="movie-poster">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.src='${fallbackSvg}'" crossorigin="anonymous">`
                    : `<img src="${fallbackSvg}" alt="No poster available">`}
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
    const posterUrl = getImageUrl(movie.poster_path);
    const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear()
        : 'N/A';

    const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22225%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad2%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%230d47a1;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2300838f;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22url(%23grad2)%22 width=%22150%22 height=%22225%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%234dd0e1%22 font-size=%2240%22 font-family=%22Arial%22%3E🎬%3C/text%3E%3C/svg%3E';

    modalBody.innerHTML = `
        <div class="modal-detail">
            <div class="modal-poster">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" onerror="this.src='${fallbackSvg}'" crossorigin="anonymous">`
                    : `<img src="${fallbackSvg}" alt="No poster available" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`}
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
