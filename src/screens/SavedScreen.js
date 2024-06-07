import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArticleContext } from '../context/ArticleContext';
import NewsList from '../components/NewsList';

const SavedScreen = () => {
  const { savedArticles } = useContext(ArticleContext);
  const navigation = useNavigation();

  const handleArticlePress = (article) => {
    navigation.navigate('Article', { article });
  };

  return (
    <View style={styles.container}>
      {savedArticles.length === 0 ? (
        <Text>No saved articles</Text>
      ) : (
        <NewsList articles={savedArticles} onArticlePress={handleArticlePress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default SavedScreen;
