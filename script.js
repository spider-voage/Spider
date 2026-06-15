const TMDB_API_KEY = '00abfeff5aca77b5e8ab34f08bd95109'; // Get free key from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
        displayMovies(data.results);
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesGrid.innerHTML = '<p>Error loading movies. Please check your API key.</p>';
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
        displayMovies(data.results);
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        if (movie.poster_path) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <div class="movie-poster">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-rating">⭐ ${(movie.vote_average / 2).toFixed(1)}/5</div>
                    <div class="movie-year">${new Date(movie.release_date).getFullYear()}</div>
                </div>
            `;
            movieCard.addEventListener('click', () => showMovieDetails(movie));
            moviesGrid.appendChild(movieCard);
        }
    });
}

function showMovieDetails(movie) {
    const modalBody = document.getElementById('modalBody');
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '🎬';

    modalBody.innerHTML = `
        <div class="modal-detail">
            <div class="modal-poster">
                ${movie.poster_path 
                    ? `<img src="${posterUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`
                    : '🎬'}
            </div>
            <div class="modal-info">
                <h2>${movie.title}</h2>
                <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <div class="modal-rating">⭐ Rating: ${(movie.vote_average / 2).toFixed(1)}/5</div>
                <p><strong>Overview:</strong></p>
                <p>${movie.overview || 'No description available.'}</p>
                <p><strong>Popularity:</strong> ${movie.popularity.toFixed(0)}</p>
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
