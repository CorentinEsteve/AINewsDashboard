# AI News Dashboard

AI News Dashboard is a React Native application designed to fetch and display AI-related news articles from multiple sources. The app displays an overview of articles on the home screen, and users can click on any article to view its detailed content. Users can also save articles to their "Saved" or "Favorites" sections for later viewing.

## Features
- Fetches news from two different APIs: News API and World News API.
- Displays a list of news articles with titles and descriptions.
- Allows users to view the full content of an article by clicking on it.
- Users can save articles to their "Saved" or "Favorites" sections.
- Search functionality to filter news articles based on keywords.
- Horizontal scrollable list with frequently used tags for quick filtering.
- Displays source information for each article.

## Prerequisites
- Node.js
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, if applicable)

## Installation
1. Clone the repository:

``sh
git clone https://github.com/your-username/AI-News-Dashboard.git
cd AI-News-Dashboard``

2. Install dependencies:

``sh
npm install
# or
yarn install``

3. Set up environment variables:
In the root directory, add your API keys in the .env file.

4. Start the development server:

```sh
npx react-native start
```

Run the app on an Android or iOS emulator:

```sh
npx react-native run-android
# or
npx react-native run-ios
```

## Project Structure

```sh
AI-News-Dashboard/
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   └── NewsList.js
│   ├── context/
│   │   └── ArticleContext.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── SavedScreen.js
│   │   ├── FavoritesScreen.js
│   │   └── ArticleScreen.js
│   └── App.js
├── index.js
├── .env
├── package.json
└── README.md
```

## API Integration

### News API
Fetches AI-related news articles from the News API.
Documentation: https://newsapi.org/docs

### World News API
Fetches AI-related news articles from the World News API.
Documentation: https://worldnewsapi.com/docs/

### Combining and Sorting
The articles from both APIs are combined and sorted by publication date.

### Debugging
To debug issues with HTML content in summaries, console.log statements are used to inspect the data returned by the World News API.

### Customizing
Adding New Tags
To add new tags for quick filtering, update the tags array in HomeScreen.js:

```sh
const tags = ['Renault', 'Apple', 'Google', 'Nvidia', 'Amazon', 'Microsoft', 'YourTag'];
```
