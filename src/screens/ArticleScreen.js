import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import cheerio from 'cheerio';

// ArticleScreen to display the full content of a selected article
const ArticleScreen = ({route}) => {
  const {article} = route.params || {}; // Handle cases where article is not passed
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!article?.url) {
      setLoading(false);
      return;
    }

    const fetchFullArticle = async () => {
      try {
        const response = await axios.get(article.url);
        const $ = cheerio.load(response.data);

        // Extract the main content of the article
        // You may need to adjust the selector based on the structure of the article page
        const articleContent = $('article').html() || $('body').html(); // Adjust this selector based on the actual structure

        const elements = [];

        // Parse and extract text and images
        $(articleContent)
          .find('p, img')
          .each((i, el) => {
            if (el.tagName === 'p') {
              elements.push({type: 'text', content: $(el).text()});
            } else if (el.tagName === 'img') {
              elements.push({type: 'image', src: $(el).attr('src')});
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.source}>Source: {article.source.name}</Text>
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
              />
            );
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
    paddingTop: 10,
    paddingBottom: 30,
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
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
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
