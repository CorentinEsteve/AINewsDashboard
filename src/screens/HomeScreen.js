import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NewsList from '../components/NewsList';

// HomeScreen to fetch and display a list of AI news articles
const HomeScreen = ({navigation}) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('AI'); // Default keyword is 'AI'
  const [searchText, setSearchText] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter keyword'); // Placeholder for search input

  useEffect(() => {
    fetchNews(keyword);
  }, [keyword]);

  const fetchNews = async keyword => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${keyword}&apiKey=f5a64c85bd3848cd98c69a6f5be173f0`,
      );
      const filteredArticles = response.data.articles.filter(
        article =>
          article.title &&
          !article.title.includes('[Removed]') &&
          article.description &&
          !article.description.includes('[Removed]'),
      );

      const accessibleArticles = await Promise.all(
        filteredArticles.map(async article => {
          try {
            await axios.get(article.url);
            return article;
          } catch (error) {
            if (error.response && error.response.status === 401) {
              return null;
            }
            return article;
          }
        }),
      );

      setNews(accessibleArticles.filter(article => article !== null));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchText.trim() === '') {
      return;
    }
    setKeyword(searchText);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setKeyword('AI');
    setPlaceholder('Enter keyword');
  };

  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

  const handleTagPress = tag => {
    setSearchText('');
    setKeyword(tag);
    setPlaceholder(tag);
  };

  const tags = ['Renault', 'Apple', 'Google', 'Nvidia', 'Amazon', 'Microsoft'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading news...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}>
            <Icon name="cancel" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={styles.tag}
            onPress={() => handleTagPress(tag)}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {news.length > 0 ? (
        <NewsList articles={news} onArticlePress={handleArticlePress} />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No results found. Try a different keyword.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  tagsContainer: {
    paddingHorizontal: 10,
  },
  tag: {
    backgroundColor: '#ddd',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#888',
  },
});

export default HomeScreen;
