import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ArticleContext} from '../context/ArticleContext';
import NewsList from '../components/NewsList';

// SavedScreen component to display the list of saved articles
const SavedScreen = () => {
  // Retrieve saved articles from context
  const {savedArticles} = useContext(ArticleContext);
  const navigation = useNavigation();

  // Handle the press event on an article
  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

  return (
    <View style={styles.container}>
      {savedArticles.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No saved article.</Text>
        </View>
      ) : (
        <NewsList
          articles={savedArticles}
          onArticlePress={handleArticlePress}
        />
      )}
    </View>
  );
};

// Styles for the SavedScreen component
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

export default SavedScreen;
