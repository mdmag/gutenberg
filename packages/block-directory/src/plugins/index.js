/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import InserterMenuDownloadableBlocksPanel from './inserter-menu-downloadable-blocks-panel';
import missingInstallView from './missing-install-view';

registerPlugin( 'block-directory', {
	render() {
		return <InserterMenuDownloadableBlocksPanel />;
	},
} );

addFilter(
	'blocks.registerBlockType',
	'block-directory/fallback',
	( settings, name ) => {
		if ( name !== 'core/missing' ) {
			return settings;
		}
		settings.edit = missingInstallView;

		return settings;
	}
);
