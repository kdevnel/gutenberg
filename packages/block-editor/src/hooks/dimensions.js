/**
 * WordPress dependencies
 */
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { Platform } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getBlockSupport } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import InspectorControls from '../components/inspector-controls';
import {
	HeightEdit,
	hasHeightSupport,
	hasHeightValue,
	resetHeight,
	useIsHeightDisabled,
} from './height';
import {
	MinHeightEdit,
	hasMinHeightSupport,
	hasMinHeightValue,
	resetMinHeight,
	useIsMinHeightDisabled,
} from './min-height';
import {
	MarginEdit,
	hasMarginSupport,
	hasMarginValue,
	resetMargin,
	useIsMarginDisabled,
} from './margin';
import {
	PaddingEdit,
	hasPaddingSupport,
	hasPaddingValue,
	resetPadding,
	useIsPaddingDisabled,
} from './padding';
import { cleanEmptyObject } from './utils';

export const DIMENSIONS_SUPPORT_KEY = '__experimentalDimensions';
export const SPACING_SUPPORT_KEY = 'spacing';
export const ALL_SIDES = [ 'top', 'right', 'bottom', 'left' ];
export const AXIAL_SIDES = [ 'vertical', 'horizontal' ];

/**
 * Inspector controls for dimensions support.
 *
 * @param {Object} props Block props.
 * @return {WPElement} Inspector controls for dimensions support features.
 */
export function DimensionsPanel( props ) {
	const isPaddingDisabled = useIsPaddingDisabled( props );
	const isMarginDisabled = useIsMarginDisabled( props );
	const isHeightDisabled = useIsHeightDisabled( props );
	const isMinHeightDisabled = useIsMinHeightDisabled( props );
	const isDisabled = useIsDimensionsDisabled( props );
	const isSupported = hasDimensionsSupport( props.name );

	if ( isDisabled || ! isSupported ) {
		return null;
	}

	const defaultDimensionsControls = getBlockSupport( props.name, [
		DIMENSIONS_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	const defaultSpacingControls = getBlockSupport( props.name, [
		SPACING_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	// Callback to reset all block support attributes controlled via this panel.
	const resetAll = () => {
		const { style } = props.attributes;

		props.setAttributes( {
			style: cleanEmptyObject( {
				...style,
				dimensions: {
					...style?.dimensions,
					height: undefined,
					minHeight: undefined,
				},
				spacing: {
					...style?.spacing,
					margin: undefined,
					padding: undefined,
				},
			} ),
		} );
	};

	return (
		<InspectorControls key="dimensions">
			<ToolsPanel
				label={ __( 'Dimensions options' ) }
				header={ __( 'Dimensions' ) }
				resetAll={ resetAll }
			>
				{ ! isHeightDisabled && (
					<ToolsPanelItem
						className="single-column"
						hasValue={ () => hasHeightValue( props ) }
						label={ __( 'Height' ) }
						onDeselect={ () => resetHeight( props ) }
						isShownByDefault={ defaultDimensionsControls?.height }
					>
						<HeightEdit { ...props } />
					</ToolsPanelItem>
				) }
				{ ! isMinHeightDisabled && (
					<ToolsPanelItem
						className="single-column"
						hasValue={ () => hasMinHeightValue( props ) }
						label={ __( 'Minimum height' ) }
						onDeselect={ () => resetMinHeight( props ) }
						isShownByDefault={
							defaultDimensionsControls?.minHeight
						}
					>
						<MinHeightEdit { ...props } />
					</ToolsPanelItem>
				) }
				{ ! isPaddingDisabled && (
					<ToolsPanelItem
						hasValue={ () => hasPaddingValue( props ) }
						label={ __( 'Padding' ) }
						onDeselect={ () => resetPadding( props ) }
						isShownByDefault={ defaultSpacingControls?.padding }
					>
						<PaddingEdit { ...props } />
					</ToolsPanelItem>
				) }
				{ ! isMarginDisabled && (
					<ToolsPanelItem
						hasValue={ () => hasMarginValue( props ) }
						label={ __( 'Margin' ) }
						onDeselect={ () => resetMargin( props ) }
						isShownByDefault={ defaultSpacingControls?.margin }
					>
						<MarginEdit { ...props } />
					</ToolsPanelItem>
				) }
			</ToolsPanel>
		</InspectorControls>
	);
}

/**
 * Determine whether there is dimensions related block support.
 *
 * @param {string} blockName Block name.
 *
 * @return {boolean} Whether there is support.
 */
export function hasDimensionsSupport( blockName ) {
	if ( Platform.OS !== 'web' ) {
		return false;
	}

	return (
		hasHeightSupport( blockName ) ||
		hasMinHeightSupport( blockName ) ||
		hasPaddingSupport( blockName ) ||
		hasMarginSupport( blockName )
	);
}

/**
 * Determines whether dimensions support has been disabled.
 *
 * @param {Object} props Block properties.
 * @return {boolean} If dimensions support is completely disabled.
 */
const useIsDimensionsDisabled = ( props = {} ) => {
	const heightDisabled = useIsHeightDisabled( props );
	const minHeightDisabled = useIsMinHeightDisabled( props );
	const paddingDisabled = useIsPaddingDisabled( props );
	const marginDisabled = useIsMarginDisabled( props );

	return (
		heightDisabled && minHeightDisabled && paddingDisabled && marginDisabled
	);
};

/**
 * Custom hook to retrieve which padding/margin is supported
 * e.g. top, right, bottom or left.
 *
 * Sides are opted into by default. It is only if a specific side is set to
 * false that it is omitted.
 *
 * @param {string} blockName Block name.
 * @param {string} feature   The feature custom sides relate to e.g. padding or margins.
 *
 * @return {Object} Sides supporting custom margin.
 */
export function useCustomSides( blockName, feature ) {
	const support = getBlockSupport( blockName, SPACING_SUPPORT_KEY );

	// Skip when setting is boolean as theme isn't setting arbitrary sides.
	if ( ! support || typeof support[ feature ] === 'boolean' ) {
		return;
	}

	return support[ feature ];
}

/**
 * Custom hook to determine whether the sides configured in the
 * block support are valid. A dimension property cannot declare
 * support for a mix of axial and individual sides.
 *
 * @param {string} blockName Block name.
 * @param {string} feature   The feature custom sides relate to e.g. padding or margins.
 *
 * @return {boolean} If the feature has a valid configuration of sides.
 */
export function useIsDimensionsSupportValid( blockName, feature ) {
	const sides = useCustomSides( blockName, feature );

	if (
		sides &&
		sides.some( ( side ) => ALL_SIDES.includes( side ) ) &&
		sides.some( ( side ) => AXIAL_SIDES.includes( side ) )
	) {
		// eslint-disable-next-line no-console
		console.warn(
			`The ${ feature } support for the "${ blockName }" block can not be configured to support both axial and arbitrary sides.`
		);
		return false;
	}

	return true;
}
