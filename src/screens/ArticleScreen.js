import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Article from '../components/Article';

// ArticleScreen to display the full content of a selected article
const ArticleScreen = ({route}) => {
  const {article} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Article article={article} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ArticleScreen;
