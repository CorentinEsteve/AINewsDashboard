import React, {useEffect, useState, useContext} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import cheerio from 'cheerio';
import {ArticleContext} from '../context/ArticleContext';

// ArticleScreen to display the full content of a selected article
const ArticleScreen = ({route}) => {
  const {article} = route.params || {}; // Handle cases where article is not passed

  // Context to manage saved and favorite articles
  const {
    saveArticle,
    removeSavedArticle,
    favoriteArticle,
    removeFavoriteArticle,
    savedArticles,
    favoriteArticles,
  } = useContext(ArticleContext);

  // State variables for content and loading status
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if the article is already saved or favorited
  const isSaved = savedArticles.some(a => a.url === article.url);
  const isFavorited = favoriteArticles.some(a => a.url === article.url);

  // Fetch the full content of the article. If the article URL is not available, stop loading
  useEffect(() => {
    if (!article?.url) {
      setLoading(false);
      return;
    }

    // Fetch full article content using Cheerio
    const fetchFullArticle = async () => {
      try {
        const response = await axios.get(article.url);
        const $ = cheerio.load(response.data);

        const articleContent = $('article').html() || $('body').html();
        const elements = [];

        $(articleContent)
          .find('p, img')
          .each((i, el) => {
            const src = $(el).attr('src');
            if (el.tagName === 'p') {
              elements.push({type: 'text', content: $(el).text()});
            } else if (
              el.tagName === 'img' &&
              src &&
              !src.endsWith('.gif') &&
              isValidImageURL(src)
            ) {
              // Exclude GIFs and invalid URLs
              elements.push({type: 'image', src});
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

  // Function to handles saving or removing the article from saved list
  const handleSaveArticle = () => {
    if (isSaved) {
      removeSavedArticle(article);
    } else {
      saveArticle(article);
    }
  };

  // Function to handle favoriting or removing the article from favorites
  const handleFavoriteArticle = () => {
    if (isFavorited) {
      removeFavoriteArticle(article);
    } else {
      favoriteArticle(article);
    }
  };

  // Function to validate image URLs
  const isValidImageURL = url => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Render loading indicator while fetching article content
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f5689" />
        <Text>Loading article...</Text>
      </View>
    );
  }

  // Render error message if the article is not found or inaccessible
  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found or inaccessible.</Text>
      </View>
    );
  }

  // Render the full article content
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerIcons}>
        <Text style={styles.source}>Source: {article.source.name}</Text>
        <TouchableOpacity onPress={handleSaveArticle} style={styles.iconButton}>
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-border'}
            size={28}
            color="#ECEFF1"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFavoriteArticle}
          style={styles.iconButton}>
          <Icon
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={28}
            color="red"
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{article.title}</Text>
        {content.map((element, index) => {
          if (element.type === 'text') {
            return (
              <Text key={index} style={styles.content}>
                {element.content}
              </Text>
            );
          } else if (element.type === 'image') {
            return (
              <Image
                key={index}
                source={{uri: element.src}}
                style={styles.image}
                onError={() =>
                  console.log(`Failed to load image: ${element.src}`)
                }
              />
            );
          }
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the ArticleScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#263238',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    marginRight: 20,
  },
  iconButton: {
    marginHorizontal: 8,
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
    paddingTop: 20, // Ensure padding at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ECEFF1',
  },
  source: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#607D8B',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginRight: 'auto',
    marginLeft: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#ECEFF1',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

export default ArticleScreen;
