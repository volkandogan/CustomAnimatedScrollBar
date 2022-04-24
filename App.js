/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, { Reducer, useReducer, useState } from "react"
import { Image, LayoutChangeEvent, LogBox, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native"
import { GestureHandlerRootView, TapGestureHandler } from "react-native-gesture-handler"
import { scrollTo, useAnimatedRef, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated"
import contacts from './src/data/contact.json'
import { ScrollBar } from "./src/scroolbar.component"

const ScrollViewSection = ({ section, ...ViewProps }) => {
  const { title } = section
  return (
    <View {...ViewProps}>
      <Header title={title} />
      {section.data.map((item, i) =>
        <ScrollViewItem key={i} item={item} />
      )}
    </View>
  )
}
const Header = ({ title }) => {
  return (
    <View style={styles.listSectionHeader}>
      <Text style={styles.listSectionHeaderText}>{title}</Text>
    </View>
  )
}
const ScrollViewItem = ({ item }) => {
  const { name, photo } = item;
  return (
    <View style={styles.listItem}>
      <Image
        style={styles.listItemImage}
        source={{ uri: photo }}
      />
      <Text>{name}</Text>
    </View>
  )
}


const initialState = {
  scrollview: 0,
  scrollbar: 0
}

const App = () => {

  const [list, _] = useState(contacts)
  const LIST_LENGTH = list.length;

  const ScrollViewRef = useAnimatedRef()


  const scrollActive = useSharedValue(false)
  const scrollIndex = useSharedValue(0) // number between 0 and (LIST_LENGTH - 1)
  const [sectionHeights, dispatch] = useReducer(reducer, initialState)
  useDerivedValue(() => {
    if (scrollActive.value) return
    scrollTo(ScrollViewRef, 0, scrollIndex.value * sectionHeights.scrollview, false)
  })


  console.log("sectionheight is", sectionHeights.scrollview)

  const handleLayout = (e, type) => {
    if (sectionHeights[type]) return
    const { height } = e.nativeEvent.layout
    dispatch({ type: type, payload: height })
  }
  function reducer(state, action) {
    switch (action.type) {
      case 'scrollview':
        return {
          ...state,
          scrollview: action.payload
        }
      case 'scrollbar':
        return {
          ...state,
          scrollbar: action.payload / LIST_LENGTH
        }
    }
  }
  const handleScroll = (event) => {
    'worklet'
    if (!scrollActive.value) return
    const newScrollIndex = Math.floor(event.nativeEvent.contentOffset.y / sectionHeights.scrollview)
    if (LIST_LENGTH > newScrollIndex && newScrollIndex >= 0) {
      scrollIndex.value = withSpring(newScrollIndex)
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={[styles.container, styles.flexRow]}>
        <TapGestureHandler onBegan={() => scrollActive.value = true}>
          <ScrollView
            ref={ScrollViewRef}
            style={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={30}
            onScroll={handleScroll}
          >
            {list.map((section, i) => (
              <ScrollViewSection key={i} section={section} onLayout={(e) => handleLayout(e, 'scrollview')} />
            ))}
          </ScrollView>
        </TapGestureHandler>
        <View style={styles.justifyCenter}>
          <ScrollBar
            list={list}
            scrollActive={scrollActive}
            onLayout={(e) => handleLayout(e, 'scrollbar')}
            scrollIndex={scrollIndex}
            sectionHeights={sectionHeights}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  listItemImage: {
    height: 40,
    width: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  listSectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  listSectionHeaderText: {
    fontSize: 30,
    fontWeight: '900',
  },
});

export default App;
