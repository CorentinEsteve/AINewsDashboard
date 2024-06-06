import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import axios from 'axios';
import NewsList from '../components/NewsList';

// HomeScreen to fetch and display a list of AI news articles
const HomeScreen = ({navigation}) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          'https://newsapi.org/v2/everything?q=AI&apiKey=f5a64c85bd3848cd98c69a6f5be173f0',
        );
        setNews(response.data.articles);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleArticlePress = article => {
    navigation.navigate('Article', {article});
  };

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
      <NewsList articles={news} onArticlePress={handleArticlePress} />
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
});

export default HomeScreen;
