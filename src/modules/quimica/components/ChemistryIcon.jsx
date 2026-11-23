import { StyleSheet, View } from 'react-native';

import { brandColors, brandRadius } from '../../../config/brandTheme';

export default function ChemistryIcon({ type, inHero = false }) {
  return (
    <View style={[styles.badge, inHero && styles.heroBadge]} accessible={false}>
      {type === 'atom' ? (
        <>
          <View style={styles.orbit} />
          <View style={[styles.orbit, styles.orbitLeft]} />
          <View style={[styles.orbit, styles.orbitRight]} />
          <View style={styles.core} />
        </>
      ) : type === 'book' ? (
        <View style={styles.book}>
          <View style={styles.page} />
          <View style={[styles.page, styles.rightPage]} />
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.tile} />
          <View style={[styles.tile, styles.filledTile]} />
          <View style={styles.tile} />
          <View style={styles.tile} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 46,
    height: 46,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadge: { width: 54, height: 54, backgroundColor: brandColors.accentSurface },
  orbit: {
    position: 'absolute',
    width: 32,
    height: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: brandColors.primary,
  },
  orbitLeft: { transform: [{ rotate: '60deg' }] },
  orbitRight: { transform: [{ rotate: '-60deg' }] },
  core: { width: 5, height: 5, borderRadius: 3, backgroundColor: brandColors.primary },
  book: { flexDirection: 'row' },
  page: {
    width: 11,
    height: 16,
    borderWidth: 1.5,
    borderColor: brandColors.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 3,
  },
  rightPage: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 4 },
  grid: { width: 23, flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  tile: {
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 2,
    borderColor: brandColors.primary,
  },
  filledTile: { backgroundColor: brandColors.secondary },
});
