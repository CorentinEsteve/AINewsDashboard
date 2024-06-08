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

const HomeScreen = ({navigation}) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('AI');
  const [searchText, setSearchText] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter keyword');
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchNews = useCallback(async (searchKeyword, searchPage) => {
    setLoading(true);
    setError(null);
    // console.log(
    //   `Fetching news for keyword: ${searchKeyword}, page: ${searchPage}`,
    // );
    try {
      const [response1, response2] = await Promise.allSettled([
        axios.get(
          `https://newsapi.org/v2/everything?q=${searchKeyword}&pageSize=10&page=${searchPage}&apiKey=f5a64c85bd3848cd98c69a6f5be173f0`,
        ),
        fetch(
          `https://api.worldnewsapi.com/search-news?text=${searchKeyword}&language=en&limit=10&page=${searchPage}`,
          {
            method: 'GET',
            headers: {
              'x-api-key': 'd9c3055d6c884202bf8a802c2a1124dd',
            },
          },
        ).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }),
      ]);

      // console.log('Responses:', response1, response2);

      const articlesFromAPI1 =
        response1.status === 'fulfilled'
          ? response1.value.data.articles.map(article => ({
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              source: {name: article.source.name},
            }))
          : [];

      const articlesFromAPI2 =
        response2.status === 'fulfilled'
          ? response2.value.news.map(article => ({
              title: article.title,
              description: decodeHtmlEntities(article.summary),
              url: article.url,
              urlToImage: article.image,
              publishedAt: article.publish_date,
              source: {name: article.source_country},
            }))
          : [];

      const combinedArticles = [...articlesFromAPI1, ...articlesFromAPI2];
      // console.log('Combined articles:', combinedArticles);

      const filteredArticles = combinedArticles.filter(
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
          } catch (catchError) {
            if (catchError.response && catchError.response.status === 401) {
              return null;
            }
            return article;
          }
        }),
      );

      const validArticles = accessibleArticles.filter(
        article => article !== null,
      );

      validArticles.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
      );

      setNews(prevNews =>
        searchPage === 1 ? validArticles : [...prevNews, ...validArticles],
      );
      setLoading(false);
    } catch (catchError) {
      console.error('Error fetching news:', catchError);
      setError(catchError.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(keyword, 1);
  }, [fetchNews, keyword]);

  const handleSearchSubmit = () => {
    if (searchText.trim() === '') {
      return;
    }
    setKeyword(searchText);
    fetchNews(searchText, 1); // Reset to page 1 with new keyword
  };

  const handleClearSearch = () => {
    setSearchText('');
    setKeyword('AI');
    setPlaceholder('Enter keyword');
    fetchNews('AI', 1); // Reset to page 1 with default keyword
  };

  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

  const handleTagPress = tag => {
    setSearchText('');
    setKeyword(tag);
    setPlaceholder(tag);
    fetchNews(tag, 1); // Reset to page 1 with selected tag
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(keyword, 1).then(() => setRefreshing(false)); // Reset to page 1 on refresh
  };

  const handleLoadMore = () => {
    if (!loading) {
      const nextPage = Math.floor(news.length / 10) + 1; // Calculate next page based on loaded articles
      fetchNews(keyword, nextPage);
    }
  };

  const renderFooter = () => {
    if (!loading) {
      return null;
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f5689" />
      </View>
    );
  };

  const tags = ['Renault', 'Apple', 'Google', 'Nvidia', 'Amazon', 'Microsoft'];

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
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
          keyExtractor={item => item.url}
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
