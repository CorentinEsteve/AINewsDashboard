import React, {createContext, useState} from 'react';

export const ArticleContext = createContext();

export const ArticleProvider = ({children}) => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [favoriteArticles, setFavoriteArticles] = useState([]);

  const saveArticle = article => {
    setSavedArticles(prevArticles => [...prevArticles, article]);
  };

  const removeSavedArticle = article => {
    setSavedArticles(prevArticles =>
      prevArticles.filter(a => a.url !== article.url),
    );
  };

  const favoriteArticle = article => {
    setFavoriteArticles(prevArticles => [...prevArticles, article]);
  };

  const removeFavoriteArticle = article => {
    setFavoriteArticles(prevArticles =>
      prevArticles.filter(a => a.url !== article.url),
    );
  };

  return (
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
