import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandColors, brandRadius, brandShadow } from '../../config/brandTheme';
import { spacing, typography } from '../../config/theme';

export function EducationScreen({ children }) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function EducationHero({ eyebrow, title, description, illustration }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        {illustration}
      </View>
      <Text accessibilityRole="header" style={styles.heroTitle}>
        {title}
      </Text>
      <Text style={styles.heroDescription}>{description}</Text>
    </View>
  );
}

export function EducationCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

export function EducationAction({ title, description, icon, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      {icon}
      <View style={styles.actionText}>
        <Text style={styles.cardTitle}>{title}</Text>
        {description && <Text style={styles.body}>{description}</Text>}
      </View>
      <View style={styles.chevron} accessible={false} />
    </Pressable>
  );
}

export function EducationMessage({ title, description, icon }) {
  return (
    <EducationCard>
      {icon}
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.body}>{description}</Text>
    </EducationCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brandColors.background },
  scroll: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  hero: {
    backgroundColor: brandColors.primary,
    borderRadius: brandRadius.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...brandShadow,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrow: {
    flex: 1,
    color: brandColors.accentSurface,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: { color: brandColors.surface, fontSize: 29, fontWeight: '800' },
  heroDescription: { color: brandColors.accentSurface, fontSize: typography.body },
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: brandRadius.card,
    backgroundColor: brandColors.surface,
    ...brandShadow,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    minHeight: 76,
    padding: spacing.md,
    borderRadius: brandRadius.card,
    backgroundColor: brandColors.surface,
    ...brandShadow,
  },
  actionPressed: { backgroundColor: brandColors.accentSurface },
  actionText: { flex: 1, gap: 3 },
  cardTitle: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  body: { color: brandColors.muted, fontSize: typography.body },
  chevron: {
    width: 8,
    height: 8,
    marginRight: 4,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: brandColors.primary,
    transform: [{ rotate: '45deg' }],
  },
});
