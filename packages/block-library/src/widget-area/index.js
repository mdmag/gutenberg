/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { layout as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;
export { metadata, name };

export const settings = {
	title: __( 'Widget Area' ),
	description: __( 'A widget area container.' ),
	__experimentalLabel: ( { name: label } ) => label,
	edit,
	icon,
};
