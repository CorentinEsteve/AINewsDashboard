import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NewsList from '../components/NewsList';

// HomeScreen component definition
const HomeScreen = ({navigation}) => {
  // State variables
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('AI');
  const [searchText, setSearchText] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter keyword');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // Function to decode HTML entities in text
  const decodeHtmlEntities = text => {
    return text
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  // Function to fetch news from APIs
  const fetchNews = useCallback(async (searchKeyword, searchPage) => {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    const WORLD_NEWS_API_KEY = process.env.WORLD_NEWS_API_KEY;

    // Set loading states based on the page number
    if (searchPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    const startTime = new Date().getTime();

    try {
      // Fetch data from both APIs
      const [response1, response2] = await Promise.allSettled([
        axios.get(
          `https://newsapi.org/v2/everything?q=${searchKeyword}&language=en&pageSize=10&page=${searchPage}&apiKey=${NEWS_API_KEY}`,
        ),
        axios.get(
          `https://api.worldnewsapi.com/search-news?text=${searchKeyword}&language=en&limit=10&page=${searchPage}`,
          {
            headers: {
              'x-api-key': WORLD_NEWS_API_KEY,
            },
          },
        ),
      ]);

      // Process the first API's response
      const articlesFromAPI1 =
        response1.status === 'fulfilled' && response1.value.status === 200
          ? response1.value.data.articles.map(article => ({
              title: article.title,
              description: article.description || '',
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              source: {name: article.source.name},
            }))
          : [];

      // Process the second API's response
      const articlesFromAPI2 =
        response2.status === 'fulfilled' && response2.value.status === 200
          ? response2.value.data.news.map(article => ({
              title: article.title,
              description: decodeHtmlEntities(article.summary || ''),
              url: article.url,
              urlToImage: article.image,
              publishedAt: article.publish_date,
              source: {name: article.source_country},
            }))
          : [];

      // Combine articles from both APIs
      const combinedArticles = [...articlesFromAPI1, ...articlesFromAPI2];

      // Filter out invalid articles
      const filteredArticles = combinedArticles.filter(
        article =>
          article.title &&
          !article.title.includes('[Removed]') &&
          article.description &&
          !article.description.includes('[Removed]'),
      );

      // Check accessibility of articles
      const accessibleArticles = await Promise.all(
        filteredArticles.map(async article => {
          try {
            await axios.get(article.url);
            return article;
          } catch (catchError) {
            if (catchError.response && catchError.response.status === 401) {
              return null;
            }
            return article;
          }
        }),
      );

      // Filter out inaccessible articles
      const validArticles = accessibleArticles.filter(
        article => article !== null,
      );

      // Sort articles by published date
      validArticles.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
      );

      // Update state with the fetched articles
      setNews(prevNews =>
        searchPage === 1 ? validArticles : [...prevNews, ...validArticles],
      );
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      const endTime = new Date().getTime();
      console.log(`Request duration: ${endTime - startTime} ms`);
    } catch (catchError) {
      console.error('Error fetching news:', catchError);
      setError(catchError.message);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch news when the component mounts, when 'fetchNews' or keyword change
  useEffect(() => {
    fetchNews(keyword, 1);
  }, [fetchNews, keyword]);

  // Handle search submit
  const handleSearchSubmit = () => {
    if (searchText.trim() === '') {
      return;
    }
    setPage(1);
    setKeyword(prevKeyword => `${prevKeyword} ${searchText}`);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchText('');
    setPage(1);
    setKeyword('AI');
    setPlaceholder('Enter keyword');
  };

  // Handle article press
  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

  // Handle tag press
  const handleTagPress = tag => {
    setSearchText('');
    setPage(1);
    setKeyword(prevKeyword => `${prevKeyword} ${tag}`);
    setPlaceholder(tag);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(keyword, 1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(keyword, nextPage);
    }
  };

  // Render footer component for loading more
  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f5689" />
      </View>
    );
  };

  // Define tags
  const tags = ['Renault', 'Apple', 'Google', 'Nvidia', 'Amazon', 'Microsoft'];

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
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => handleTagPress(tag)}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={({item}) => (
            <NewsList articles={[item]} onArticlePress={handleArticlePress} />
          )}
          keyExtractor={(item, index) => item.url + index.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFD8DC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: '100%',
    height: 30,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    paddingLeft: 15,
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  tagsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#ECEFF1',
    height: 30,
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
    justifyContent: 'top',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default HomeScreen;
