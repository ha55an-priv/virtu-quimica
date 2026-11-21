import { StyleSheet, Text, View } from 'react-native';

import { brandColors, brandRadius } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import {
  EducationAction,
  EducationCard,
  EducationHero,
  EducationMessage,
  EducationScreen,
} from '../../../shared/components/EducationLayout';
import ChemistryIcon from '../components/ChemistryIcon';
import { QUIMICA_ROUTES } from '../routes';

function InicioScreen({ navigation, nombreCompleto, docente = false }) {
  const nombre = typeof nombreCompleto === 'string' ? nombreCompleto.trim() : '';
  const saludo = nombre ? `Hola, ${nombre}` : 'Te damos la bienvenida';
  const role = docente ? 'Docente' : 'Estudiante';

  return (
    <EducationScreen>
      <EducationHero
        eyebrow={`Virtu Química · ${role}`}
        title={saludo}
        description={
          docente
            ? 'Consulta los recursos de Química para preparar tus clases.'
            : 'Explora los temas de Química y conoce los elementos de la tabla periódica.'
        }
        illustration={<ChemistryIcon type="atom" inHero />}
      />
      <EducationAction
        title="Lecciones"
        description="Unidades y temas de Química."
        icon={<ChemistryIcon type="book" />}
        onPress={() => navigation.navigate(QUIMICA_ROUTES.unidadesLecciones)}
      />
      <EducationAction
        title="Catálogo de elementos"
        description="Elementos y fichas de la tabla periódica."
        icon={<ChemistryIcon type="table" />}
        onPress={() => navigation.navigate(QUIMICA_ROUTES.catalogo)}
      />
    </EducationScreen>
  );
}

export function InicioEstudianteScreen({ navigation, nombreCompleto }) {
  return <InicioScreen navigation={navigation} nombreCompleto={nombreCompleto} />;
}

export function InicioDocenteScreen({ navigation, nombreCompleto }) {
  return <InicioScreen navigation={navigation} nombreCompleto={nombreCompleto} docente />;
}

export function UnidadesLeccionesScreen() {
  return (
    <EducationScreen>
      <EducationHero
        eyebrow="Aprendizaje"
        title="Unidades y lecciones"
        description="Los temas de Química estarán organizados por unidad."
        illustration={<ChemistryIcon type="book" inHero />}
      />
      <EducationMessage
        icon={<ChemistryIcon type="book" />}
        title="Contenido en preparación"
        description="Aquí podrás abrir una unidad y consultar sus lecciones cuando estén disponibles."
      />
    </EducationScreen>
  );
}

export function CatalogoScreen({ navigation }) {
  return (
    <EducationScreen>
      <EducationHero
        eyebrow="Tabla periódica"
        title="Catálogo de elementos"
        description="Un espacio para consultar los elementos químicos y sus propiedades."
        illustration={<ChemistryIcon type="table" inHero />}
      />
      <EducationMessage
        title="Catálogo en preparación"
        description="El listado y la búsqueda estarán disponibles cuando se integre el catálogo."
      />
      <EducationAction
        title="Abrir ficha provisional"
        icon={<ChemistryIcon type="atom" />}
        onPress={() => navigation.navigate(QUIMICA_ROUTES.fichaElemento)}
      />
    </EducationScreen>
  );
}

export function FichaElementoScreen() {
  return (
    <EducationScreen>
      <EducationHero
        eyebrow="Tabla periódica"
        title="Ficha de elemento"
        description="Vista provisional sin datos del elemento."
        illustration={<ChemistryIcon type="atom" inHero />}
      />
      <EducationCard>
        <View style={styles.elementHeader}>
          <View style={styles.elementTile}>
            <Text style={styles.atomicNumber} accessible={false}>
              —
            </Text>
            <Text style={styles.symbol} accessible={false}>
              —
            </Text>
          </View>
          <View style={styles.elementName}>
            <Text style={styles.title}>Nombre del elemento</Text>
            <Text style={styles.pending}>Sin datos disponibles</Text>
          </View>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Símbolo</Text>
          <Text style={styles.pending}>Pendiente</Text>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Número atómico</Text>
          <Text style={styles.pending}>Pendiente</Text>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Propiedades</Text>
          <Text style={styles.pending}>Pendientes</Text>
        </View>
      </EducationCard>
    </EducationScreen>
  );
}

const styles = StyleSheet.create({
  elementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  elementTile: {
    width: 76,
    height: 76,
    padding: spacing.sm,
    justifyContent: 'center',
    backgroundColor: brandColors.accentSurface,
    borderColor: brandColors.secondary,
    borderWidth: 1,
    borderRadius: brandRadius.control,
  },
  atomicNumber: { position: 'absolute', top: 5, right: 8, color: brandColors.muted, fontSize: 14 },
  symbol: { textAlign: 'center', color: brandColors.primary, fontSize: 30, fontWeight: '800' },
  elementName: { flex: 1, gap: 4 },
  title: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  property: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: brandColors.border,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  propertyLabel: { color: brandColors.text, fontSize: typography.body, fontWeight: '600' },
  pending: { color: brandColors.muted, fontSize: typography.body },
});
