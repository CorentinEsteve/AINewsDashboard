import React, { useEffect, useState } from 'react';
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
  ScrollView
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NewsList from '../components/NewsList';

const HomeScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('AI');
  const [searchText, setSearchText] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter keyword');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews(keyword, 1);
  }, [keyword]);

  const decodeHtmlEntities = (text) => {
    return text
      .replace(/<\/?[^>]+(>|$)/g, "") 
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  const fetchNews = async (keyword, page) => {
    setLoading(true);
    try {
      const [response1, response2] = await Promise.allSettled([
        axios.get(`https://newsapi.org/v2/everything?q=${keyword}&pageSize=10&page=${page}&apiKey=f5a64c85bd3848cd98c69a6f5be173f0`),
        fetch(`https://api.worldnewsapi.com/search-news?text=Weather&language=en&limit=10&page=${page}`, {
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

      const articlesFromAPI1 = response1.status === 'fulfilled' ? response1.value.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      })) : [];

      const articlesFromAPI2 = response2.status === 'fulfilled' ? response2.value.news.map(article => ({
        title: article.title,
        description: decodeHtmlEntities(article.summary),
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publish_date,
        source: { name: article.source_country }
      })) : [];

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

      validArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setNews(prevNews => page === 1 ? validArticles : [...prevNews, ...validArticles]);
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
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setKeyword('AI');
    setPlaceholder('Enter keyword');
    setPage(1);
  };

  const handleArticlePress = article => {
    navigation.navigate('Article', { article });
  };

  const handleTagPress = tag => {
    setSearchText('');
    setKeyword(tag);
    setPlaceholder(tag);
    setPage(1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(keyword, 1).then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (!loading) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchNews(keyword, nextPage);
        return nextPage;
      });
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f5689" />
      </View>
    );
  };

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
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
      <FlatList
        data={news}
        renderItem={({ item }) => (
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
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#ddd',
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
});

export default HomeScreen;
