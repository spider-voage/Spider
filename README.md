# Spider Voyage - Entertainment Hub

A modern, responsive entertainment website for discovering movies with a beautiful cyan and blue spider-themed design.

## Features

✨ **Animated Spider Theme** - Rotating spider icon and web-inspired design  
🎬 **Movie Discovery** - Browse popular movies and search for specific titles  
⭐ **Ratings & Information** - View movie ratings, release dates, and overviews  
📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices  
🔍 **Smart Search** - Real-time movie search with Enter key support  
💫 **Smooth Animations** - Beautiful transitions and hover effects  
🌐 **Legal Content** - Powered by TMDB (The Movie Database) API  

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Free TMDB API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/spider-voage/Spider.git
   cd Spider
   ```

2. **Get a TMDB API Key**
   - Visit https://www.themoviedb.org/settings/api
   - Sign up for a free account
   - Copy your API key

3. **Add your API key**
   - Open `script.js`
   - Replace `'YOUR_TMDB_API_KEY_HERE'` with your actual TMDB API key:
   ```javascript
   const TMDB_API_KEY = 'your_actual_api_key_here';
   ```

4. **Open the website**
   - Simply open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`

## Usage

- **Browse Movies** - Popular movies load automatically when you visit
- **Search** - Type a movie title in the search bar and press Enter or click Search
- **View Details** - Click any movie card to see more information in a modal
- **Navigate** - Use the navigation menu to move between sections

## File Structure

```
Spider/
├── index.html      # Main HTML file
├── styles.css      # Styling and animations
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (Vanilla)** - No dependencies
- **TMDB API** - Movie data source

## API Attribution

This project uses The Movie Database (TMDB) API for movie data.
- Visit: https://www.themoviedb.org/
- API Documentation: https://developer.themoviedb.org/docs

## Color Scheme

- **Primary Blue**: `#0a1929`
- **Cyan Accent**: `#00bcd4`
- **Light Cyan**: `#4dd0e1`
- **Teal**: `#00838f`
- **Sky Blue**: `#0288d1`

## Responsive Breakpoints

- **Desktop**: Full layout with optimized spacing
- **Tablet**: Adjusted navigation and grid
- **Mobile**: Single column layout, optimized touch targets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- [ ] User authentication and watchlists
- [ ] Movie recommendations
- [ ] Review and rating system
- [ ] Dark/Light theme toggle
- [ ] TV shows support
- [ ] Advanced filtering options
- [ ] Local storage for favorites

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this repository and submit pull requests for any improvements!

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ by Spider Voyage Team**