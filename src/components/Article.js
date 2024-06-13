import React from 'react';
import {Text, StyleSheet, ScrollView} from 'react-native';

// Article component to display full article details
const Article = ({article}) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.content}>{article.content}</Text>
    </ScrollView>
  );
};

// Styles for the Article component
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  content: {
    fontSize: 16,
  },
});

export default Article;
