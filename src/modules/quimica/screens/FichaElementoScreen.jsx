import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brandColors, brandRadius, brandShadow } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import {
  EducationCard,
  EducationHero,
  EducationMessage,
  EducationScreen,
} from '../../../shared/components/EducationLayout';
import ChemistryIcon from '../components/ChemistryIcon';
import { obtenerElementoPorIdOSimbolo } from '../services/catalogoElementosService';
import { normalizarElemento } from '../services/validacionElementos';

function resolverElementoEntrada({ elemento, elementoId, route }) {
  const candidato = elemento ?? route?.params?.elemento ?? null;
  if (candidato) {
    const { elemento: ok } = normalizarElemento(candidato);
    return { elemento: ok, motivo: ok ? null : 'invalido' };
  }

  const id = elementoId ?? route?.params?.elementoId ?? route?.params?.id;
  if (id !== undefined && id !== null) {
    const hallado = obtenerElementoPorIdOSimbolo(id);
    return { elemento: hallado, motivo: hallado ? null : 'no-encontrado' };
  }

  return { elemento: null, motivo: 'sin-datos' };
}

function obtenerMensajeSinElemento(motivo) {
  if (motivo === 'no-encontrado') {
    return {
      titulo: 'Elemento no encontrado',
      descripcion: 'No se encontró un elemento válido en el catálogo local para el identificador indicado.',
    };
  }
  if (motivo === 'invalido') {
    return {
      titulo: 'Datos de elemento no válidos',
      descripcion: 'El registro recibido no cumple con el contrato esperado de la ficha.',
    };
  }
  return {
    titulo: 'Elemento no disponible',
    descripcion: 'No se recibió un elemento válido para mostrar en la ficha.',
  };
}

function manejarRegreso({ onBack, navigation }) {
  if (typeof onBack === 'function') {
    onBack();
    return;
  }
  if (navigation && typeof navigation.goBack === 'function') {
    navigation.goBack();
  }
}

/**
 * Pantalla de ficha de elemento químico (RF-Q-07).
 * Valida el elemento mediante el contrato de Q-24 (`normalizarElemento`)
 * y muestra solo los campos disponibles sin inventar información.
 */
export default function FichaElementoScreen(props) {
  const { navigation, onBack } = props;
  const { elemento, motivo } = resolverElementoEntrada(props);
  const puedeVolver =
    typeof onBack === 'function' || (navigation && typeof navigation.goBack === 'function');

  if (!elemento) {
    const mensaje = obtenerMensajeSinElemento(motivo);
    return (
      <EducationScreen>
        <View style={styles.container}>
          <EducationHero
            eyebrow="Tabla periódica"
            title="Ficha de elemento"
            description="Consulta los datos principales del elemento seleccionado."
            illustration={<ChemistryIcon type="atom" inHero />}
          />
          <EducationMessage
            icon={<ChemistryIcon type="atom" />}
            title={mensaje.titulo}
            description={mensaje.descripcion}
          />
          {puedeVolver ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => manejarRegreso({ onBack, navigation })}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>
          ) : null}
        </View>
      </EducationScreen>
    );
  }

  const { nombre, simbolo, numeroAtomico, clasificacion, descripcion, ejemploOpcional } = elemento;
  const numeroAtomicoTexto = String(numeroAtomico);

  return (
    <EducationScreen>
      <View style={styles.container}>
        <EducationHero
          eyebrow="Tabla periódica · Ficha"
          title={nombre}
          description={`Símbolo: ${simbolo} · Número atómico: ${numeroAtomicoTexto}`}
          illustration={<ChemistryIcon type="atom" inHero />}
        />

        <EducationCard>
          <View style={styles.headerRow}>
            <View style={styles.tile} accessible={false}>
              <Text style={styles.atomicNumber}>{numeroAtomicoTexto}</Text>
              <Text style={styles.symbol}>{simbolo}</Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{nombre}</Text>
              {clasificacion ? (
                <Text style={styles.classification}>{clasificacion}</Text>
              ) : (
                <Text style={styles.mutedNote}>Clasificación no especificada</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.label}>Descripción</Text>
            {descripcion ? (
              <Text style={styles.bodyText}>{descripcion}</Text>
            ) : (
              <Text style={styles.mutedNote}>Sin descripción registrada.</Text>
            )}
          </View>

          {ejemploOpcional ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.label}>Ejemplo</Text>
              <Text style={styles.bodyText}>{ejemploOpcional}</Text>
            </View>
          ) : null}
        </EducationCard>

        {puedeVolver ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => manejarRegreso({ onBack, navigation })}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        ) : null}
      </View>
    </EducationScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tile: {
    width: 76,
    height: 76,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.accentSurface,
    borderColor: brandColors.secondary,
    borderWidth: 1,
    borderRadius: brandRadius.control,
  },
  atomicNumber: {
    position: 'absolute',
    top: 5,
    right: 8,
    fontSize: 13,
    color: brandColors.muted,
    fontWeight: '600',
  },
  symbol: {
    fontSize: 28,
    fontWeight: '800',
    color: brandColors.primary,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: brandColors.primary,
  },
  classification: {
    fontSize: typography.body,
    color: brandColors.secondary,
    fontWeight: '600',
  },
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: brandColors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    gap: 4,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '700',
    color: brandColors.text,
  },
  bodyText: {
    fontSize: typography.body,
    lineHeight: 22,
    color: brandColors.text,
  },
  mutedNote: {
    fontSize: 14,
    lineHeight: 20,
    color: brandColors.muted,
  },
  backButton: {
    alignSelf: 'center',
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    ...brandShadow,
  },
  pressed: {
    opacity: 0.85,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
});