import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ArticleContext} from '../context/ArticleContext';
import NewsList from '../components/NewsList';

// FavoritesScreen component to display the list of favorite articles
const FavoritesScreen = () => {
  // Retrieve favorite articles from the ArticleContext
  const {favoriteArticles} = useContext(ArticleContext);
  const navigation = useNavigation();

  // Handle the press event on an article
  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

  return (
    <View style={styles.container}>
      {favoriteArticles.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No favorite article.</Text>
        </View>
      ) : (
        <NewsList
          articles={favoriteArticles}
          onArticlePress={handleArticlePress}
        />
      )}
    </View>
  );
};

// Styles for the FavoritesScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 1,
    backgroundColor: '#263238',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
  },
});

export default FavoritesScreen;
