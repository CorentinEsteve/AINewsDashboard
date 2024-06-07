import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// NewsList component to display list of news articles
const NewsList = ({ articles, onArticlePress }) => {
  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => onArticlePress(item)} key={index}>
      <View style={styles.newsItem}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item, index) =>
        item.url ? `${item.url}-${index}` : index.toString()
      } // Ensure unique keys
    />
  );
};

const styles = StyleSheet.create({
  newsItem: {
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    paddingBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
  },
});

export default NewsList;
