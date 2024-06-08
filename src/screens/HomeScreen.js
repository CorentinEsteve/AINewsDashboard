import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NewsList from '../components/NewsList';

// HomeScreen to fetch and display a list of AI news articles
const HomeScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('AI'); // Default keyword is 'AI'
  const [searchText, setSearchText] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter keyword'); // Placeholder for search input

  useEffect(() => {
    fetchNews(keyword);
  }, [keyword]);


// Function to remove HTML tags and decode HTML entities
const decodeHtmlEntities = (text) => {
    return text
      .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
      .replace(/&amp;/g, '&')  // Replace &amp; with &
      .replace(/&lt;/g, '<')   // Replace &lt; with <
      .replace(/&gt;/g, '>')   // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'")  // Replace &#39; with '
      .replace(/&nbsp;/g, ' '); // Replace &nbsp; with space
  };
  
  const fetchNews = async keyword => {
    setLoading(true);
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`https://newsapi.org/v2/everything?q=${keyword}&apiKey=f5a64c85bd3848cd98c69a6f5be173f0`),
        fetch(`https://api.worldnewsapi.com/search-news?text=Weather&language=en`, {
          method: 'GET',
          headers: {
            'x-api-key': 'd9c3055d6c884202bf8a802c2a1124dd'
          }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
      ]);
  
      const articlesFromAPI1 = response1.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      }));
  
      const articlesFromAPI2 = response2.news.map(article => ({
        title: article.title,
        description: decodeHtmlEntities(article.summary), // Clean HTML tags and decode entities
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publish_date,
        source: { name: article.source_country }
      }));
  
      const combinedArticles = [...articlesFromAPI1, ...articlesFromAPI2];
  
      const filteredArticles = combinedArticles.filter(
        article =>
          article.title &&
          !article.title.includes('[Removed]') &&
          article.description &&
          !article.description.includes('[Removed]')
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
        })
      );
  
      const validArticles = accessibleArticles.filter(article => article !== null);
  
      // Sort articles by date
      validArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
      setNews(validArticles);
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
    navigation.navigate('Article', { article });
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
        <ActivityIndicator size="large" color="#2f5689" />
        <Text>Loading news...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
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
    backgroundColor: '#ECEFF1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 200,
    height: 130,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
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
    marginHorizontal: 20,
  },
  tag: {
    backgroundColor: '#ddd',
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 40,
    borderRadius: 15,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;
