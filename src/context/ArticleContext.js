import React, {createContext, useState} from 'react';

// Create a context for articles
export const ArticleContext = createContext();

// ArticleProvider provides the context values to the children components
export const ArticleProvider = ({children}) => {
  // Manage the list of saved and favorite articles
  const [savedArticles, setSavedArticles] = useState([]);
  const [favoriteArticles, setFavoriteArticles] = useState([]);

  // Function to save an article to the list of saved articles
  const saveArticle = article => {
    setSavedArticles(prevArticles => [...prevArticles, article]);
  };

  // Function to remove an article from the list of saved articles
  const removeSavedArticle = article => {
    setSavedArticles(prevArticles =>
      prevArticles.filter(a => a.url !== article.url),
    );
  };

  // Function to favorite an article
  const favoriteArticle = article => {
    setFavoriteArticles(prevArticles => [...prevArticles, article]);
  };

  // Function to remove an article from the list of favorite articles
  const removeFavoriteArticle = article => {
    setFavoriteArticles(prevArticles =>
      prevArticles.filter(a => a.url !== article.url),
    );
  };

  return (
    // Provide the context values to the children components
    <ArticleContext.Provider
      value={{
        savedArticles,
        saveArticle,
        removeSavedArticle,
        favoriteArticles,
        favoriteArticle,
        removeFavoriteArticle,
      }}>
      {children}
    </ArticleContext.Provider>
  );
};
