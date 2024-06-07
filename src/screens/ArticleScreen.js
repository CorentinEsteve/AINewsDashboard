import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import cheerio from 'cheerio';
import { ArticleContext } from '../context/ArticleContext';

// ArticleScreen to display the full content of a selected article
const ArticleScreen = ({ route }) => {
  const { article } = route.params || {}; // Handle cases where article is not passed
  const { saveArticle, removeSavedArticle, favoriteArticle, removeFavoriteArticle, savedArticles, favoriteArticles } = useContext(ArticleContext);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSaved = savedArticles.some(a => a.url === article.url);
  const isFavorited = favoriteArticles.some(a => a.url === article.url);

  useEffect(() => {
    if (!article?.url) {
      setLoading(false);
      return;
    }

    const fetchFullArticle = async () => {
      try {
        const response = await axios.get(article.url);
        const $ = cheerio.load(response.data);

        const articleContent = $('article').html() || $('body').html();
        const elements = [];

        $(articleContent).find('p, img').each((i, el) => {
          const src = $(el).attr('src');
          if (el.tagName === 'p') {
            elements.push({ type: 'text', content: $(el).text() });
          } else if (el.tagName === 'img' && src && !src.endsWith('.gif') && isValidImageURL(src)) { // Exclude GIFs and invalid URLs
            elements.push({ type: 'image', src });
          }
        });

        setContent(elements);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchFullArticle();
  }, [article?.url]);

  const handleSaveArticle = () => {
    if (isSaved) {
      removeSavedArticle(article);
    } else {
      saveArticle(article);
    }
  };

  const handleFavoriteArticle = () => {
    if (isFavorited) {
      removeFavoriteArticle(article);
    } else {
      favoriteArticle(article);
    }
  };

  const isValidImageURL = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found or inaccessible.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={handleSaveArticle} style={styles.iconButton}>
          <Icon name={isSaved ? "bookmark" : "bookmark-border"} size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavoriteArticle} style={styles.iconButton}>
          <Icon name={isFavorited ? "favorite" : "favorite-border"} size={28} color="red" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.source}>Source: {article.source.name}</Text>
        <Text style={styles.title}>{article.title}</Text>
        {content.map((element, index) => {
          if (element.type === 'text') {
            return <Text key={index} style={styles.content}>{element.content}</Text>;
          } else if (element.type === 'image') {
            return <Image key={index} source={{ uri: element.src }} style={styles.image} onError={() => console.log(`Failed to load image: ${element.src}`)} />;
          }
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  iconButton: {
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  contentContainer: {
    padding: 30,
    paddingBottom: 30, // Ensure padding at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  source: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#888',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  image: {
    width: '100%', // Full width
    height: undefined,
    aspectRatio: 1.5, // Example aspect ratio; adjust if needed
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

export default ArticleScreen;
