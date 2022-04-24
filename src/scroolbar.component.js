import React from 'react'
import { StyleSheet, View, Text } from "react-native"
import { PanGestureHandler } from "react-native-gesture-handler"
import Animated, { Easing, useAnimatedGestureHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { ScrollbarIndicator } from './scrollbar-indicator.component'

export const ScrollBar = ({ list, scrollIndex,scrollActive, sectionHeights, ...ViewProps }) => {
    const LIST_LENGTH = list.length
    const indicatorActive = useSharedValue(false)
    // return the scrollIndex in which the finger is located
    const getSectionFromScrollY = (scrollY) => {
        'worklet'
        return Math.floor(scrollY / sectionHeights.scrollbar)
    }

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (event, ctx) => {
            scrollActive.value = false
            indicatorActive.value = true
            scrollIndex.value = withTiming(getSectionFromScrollY(event.y), { duration: 500 })
        },
        onActive: (event, ctx) => {
            scrollActive.value = false
            indicatorActive.value = true
            const newScrollIndex = getSectionFromScrollY(event.y)
            if (LIST_LENGTH > newScrollIndex && newScrollIndex >= 0) {
                scrollIndex.value = withSpring(newScrollIndex)
            }
        },
        onEnd: (_, ctx) => {
            indicatorActive.value = false
        },
    })

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View {...ViewProps} style={StyleSheet.positionRelative}>
                {list.map((section, i) => {
                    return (<ScrollbarItem
                        key={i}
                        section={section}
                        scrollIndex={scrollIndex}
                        index={i}
                    />)
                })}
                <ScrollbarIndicator scrollIndex={scrollIndex} sectionHeights={sectionHeights} active={indicatorActive} />
            </Animated.View>
        </PanGestureHandler>
    )
}

const ScrollbarItem = ({ section, index, scrollIndex }) => {
    const { title } = section
    const distance = useDerivedValue(() => {
        return Math.abs(scrollIndex.value - index)
    })

    const active = useDerivedValue(() => {
        return distance.value < 0.5
    })
    const elevation = useDerivedValue(() => {
        if (distance.value < 3 / 2 * Math.PI) {
            return (Math.cos(2 / 3 * distance.value) + 1) / 2
        }
        return 0
    })
    const animatedViewStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: - elevation.value * 40 }]
        }
    })

    const animatedTextStyles = useAnimatedStyle(() => {
        return {
            color: active.value ? '#FF6548' : '#693FC4',
            transform: [
                { scale: withSpring(active.value ? 2 : 1) }
            ]
        }
    })
    return (
        <Animated.View style={[styles.scrollbarItem, animatedViewStyles]}>
            <Animated.Text style={[styles.scrollbarItemText, animatedTextStyles]}>{title}</Animated.Text>
            <View style={styles.scrollbarItemLine} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    positionRelative: {
        position: 'relative',
    },
    scrollbarItem: {
        width: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        marginRight: 15,
    },
    scrollbarItemLine: {
        height: 2,
        width: 20,
        backgroundColor: '#e4e4e4',
        marginLeft: 3,
    },
    scrollbarItemText: {
        color: '#693FC4',
        fontWeight: 'bold'
    },
})